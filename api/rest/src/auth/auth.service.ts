import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import axios from 'axios';
import { User } from 'src/users/entities/user.entity';
import { User as UserSchemaEntity, UserDocument } from 'src/users/schemas/user.schema';
import {
  Shop as ShopSchemaEntity,
  ShopDocument,
} from 'src/shops/schemas/shop.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserSchemaEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ShopSchemaEntity.name)
    private readonly shopModel: Model<ShopDocument>,
  ) {}

  private createAuthToken(email: string): string {
    return Buffer.from(email, 'utf8').toString('base64');
  }

  private getApiBaseUrl(): string {
    return process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5050}/api`;
  }

  private resolveClientRedirectUrl(encoded?: string): string {
    if (!encoded) {
      return process.env.SHOP_URL || 'http://localhost:3005/social-login';
    }
    try {
      return decodeURIComponent(encoded);
    } catch {
      return process.env.SHOP_URL || 'http://localhost:3005/social-login';
    }
  }

  private buildErrorRedirect(redirectUri: string, message: string): string {
    const separator = redirectUri.includes('?') ? '&' : '?';
    return `${redirectUri}${separator}error=${encodeURIComponent(message)}`;
  }

  private async getOrCreateSocialUser(profile: {
    provider: string;
    providerId: string;
    email?: string;
    name?: string;
  }): Promise<UserDocument> {
    const normalizedEmail = profile.email?.toLowerCase().trim();
    const fallbackEmail = `${profile.provider}_${profile.providerId}@social.local`;
    const email = normalizedEmail || fallbackEmail;

    let user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.userModel.create({
        id: uuidv4(),
        name: profile.name || 'Social User',
        email,
        password: uuidv4(),
        is_active: true,
        is_admin: false,
      });
    }

    return user;
  }

  private async resolveGoogleProfileByAccessToken(accessToken: string): Promise<{
    provider: 'google';
    providerId: string;
    email?: string;
    name?: string;
  }> {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = response.data || {};
    if (!data.sub) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    return {
      provider: 'google',
      providerId: data.sub,
      email: data.email,
      name: data.name,
    };
  }

  private async resolveFacebookProfileByAccessToken(accessToken: string): Promise<{
    provider: 'facebook';
    providerId: string;
    email?: string;
    name?: string;
  }> {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email',
        access_token: accessToken,
      },
    });
    const data = response.data || {};
    if (!data.id) {
      throw new UnauthorizedException('Invalid Facebook access token');
    }

    return {
      provider: 'facebook',
      providerId: data.id,
      email: data.email,
      name: data.name,
    };
  }

  private async authenticateSocialUserByAccessToken(
    provider: string,
    accessToken: string,
  ): Promise<AuthResponse> {
    const normalizedProvider = provider?.toLowerCase();

    const profile =
      normalizedProvider === 'google'
        ? await this.resolveGoogleProfileByAccessToken(accessToken)
        : normalizedProvider === 'facebook'
          ? await this.resolveFacebookProfileByAccessToken(accessToken)
          : null;

    if (!profile) {
      throw new BadRequestException('Unsupported social provider');
    }

    const user = await this.getOrCreateSocialUser(profile);
    return {
      token: this.createAuthToken(user.email),
      permissions: ['super_admin', 'customer'],
    };
  }

  getOAuthRedirectUrl(provider: 'google' | 'facebook', redirectUri?: string): string {
    const callbackBase = this.getApiBaseUrl();
    const callbackUrl = `${callbackBase}/oauth/${provider}/callback`;
    const encodedRedirect = encodeURIComponent(
      redirectUri || process.env.SHOP_URL || 'http://localhost:3005/social-login',
    );

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new BadRequestException('GOOGLE_CLIENT_ID is not configured');
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        access_type: 'online',
        state: encodedRedirect,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      throw new BadRequestException('FACEBOOK_CLIENT_ID is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'public_profile,email',
      state: encodedRedirect,
    });
    return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
  }

  async handleOAuthCallback(
    provider: 'google' | 'facebook',
    code: string,
    state?: string,
  ): Promise<string> {
    const redirectUri = this.resolveClientRedirectUrl(state);

    if (!code) {
      return this.buildErrorRedirect(redirectUri, 'Missing authorization code');
    }

    try {
      const callbackBase = this.getApiBaseUrl();
      const callbackUrl = `${callbackBase}/oauth/${provider}/callback`;
      let accessToken = '';

      if (provider === 'google') {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new BadRequestException('Google OAuth credentials are not configured');
        }

        const tokenResponse = await axios.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: callbackUrl,
            grant_type: 'authorization_code',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
        accessToken = tokenResponse.data?.access_token;
      } else {
        const clientId = process.env.FACEBOOK_CLIENT_ID;
        const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new BadRequestException('Facebook OAuth credentials are not configured');
        }

        const tokenResponse = await axios.get(
          'https://graph.facebook.com/v20.0/oauth/access_token',
          {
            params: {
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: callbackUrl,
              code,
            },
          },
        );
        accessToken = tokenResponse.data?.access_token;
      }

      if (!accessToken) {
        throw new UnauthorizedException('Unable to get social access token');
      }

      const authResponse = await this.authenticateSocialUserByAccessToken(provider, accessToken);
      const separator = redirectUri.includes('?') ? '&' : '?';
      return `${redirectUri}${separator}token=${encodeURIComponent(authResponse.token)}`;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Social login failed';
      return this.buildErrorRedirect(redirectUri, message);
    }
  }

  private decodeEmailFromAuthHeader(authHeader?: string): string | undefined {
    if (!authHeader) return undefined;
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token || token === 'jwt token') return undefined;

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      return decoded.includes('@') ? decoded : undefined;
    } catch {
      return undefined;
    }
  }

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const exists = await this.userModel.findOne({ email: createUserInput.email }).exec();
    if (exists) {
      throw new BadRequestException('Email is already in use');
    }

    await this.userModel.create({
      ...createUserInput,
      id: uuidv4(),
      is_active: true,
      is_admin: false,
    });

    return {
      token: this.createAuthToken(createUserInput.email),
      permissions: ['super_admin', 'customer'],
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ email: loginInput.email, password: loginInput.password })
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.createAuthToken(user.email),
      permissions: ['super_admin', 'customer'],
    };
  }
  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<CoreResponse> {
    console.log(changePasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(forgetPasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(verifyForgetPasswordTokenInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(resetPasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    if (!socialLoginDto?.provider || !socialLoginDto?.access_token) {
      throw new BadRequestException('provider and access_token are required');
    }

    return this.authenticateSocialUserByAccessToken(
      socialLoginDto.provider,
      socialLoginDto.access_token,
    );
  }
  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
    };
  }
  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log('OTP Verification:', verifyOtpInput);
    // Accept any OTP for testing (including 0000)
    return {
      message: 'OTP verified successfully (test mode)',
      success: true,
    };
  }
  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log('OTP Send Request:', otpInput);
    // In test mode, always return success with dummy OTP 0000
    console.log('Test OTP Code: 0000 (use this for verification)');
    return {
      message: 'OTP sent successfully. For testing, use OTP: 0000',
      success: true,
      id: '1',
      provider: 'test',
      phone_number: otpInput.phone_number || '+919494949494',
      is_contact_exist: true,
    };
  }

  // async getUsers({ text, first, page }: GetUsersArgs): Promise<UserPaginator> {
  //   const startIndex = (page - 1) * first;
  //   const endIndex = page * first;
  //   let data: User[] = this.users;
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }
  //   const results = data.slice(startIndex, endIndex);
  //   return {
  //     data: results,
  //     paginatorInfo: paginate(data.length, page, first, results.length),
  //   };
  // }
  // public getUser(getUserArgs: GetUserArgs): User {
  //   return this.users.find((user) => user.id === getUserArgs.id);
  // }
  async me(authHeader?: string): Promise<User> {
    const emailFromToken = this.decodeEmailFromAuthHeader(authHeader);

    const userDocument = emailFromToken
      ? await this.userModel.findOne({ email: emailFromToken }).exec()
      : await this.userModel.findOne().sort({ _id: -1 }).exec();

    if (!userDocument) {
      throw new UnauthorizedException('User not found');
    }

    const userObject =
      typeof userDocument.toObject === 'function'
        ? userDocument.toObject()
        : (userDocument as unknown as Record<string, unknown>);

    // If user doesn't have an id, generate and save one
    if (!userObject?.id) {
      const newId = uuidv4();
      userObject.id = newId;
      await this.userModel.updateOne({ _id: userDocument._id }, { id: newId });
    }

    const ownerConditions: Record<string, unknown>[] = [];
    if (userObject?.email) {
      ownerConditions.push({ 'owner.email': userObject.email });
    }
    if (userObject?.id) {
      ownerConditions.push({ 'owner.id': userObject.id });
    }
    if (typeof userObject?.shop_id === 'number') {
      ownerConditions.push({ id: userObject.shop_id });
    }

    const myShops = ownerConditions.length
      ? await this.shopModel
          .find({ $or: ownerConditions })
          .sort({ updatedAt: -1 })
          .exec()
      : [];

    return {
      ...(userObject as unknown as User),
      shops: myShops as unknown as any,
      managed_shop: (myShops?.[0] as unknown as any) ?? (userObject as any).managed_shop,
    } as User;
  }

  // updateUser(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }
}
