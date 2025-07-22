import api from '@/api'

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthenticateRequest {
  email: string;
  password: string;
}

interface AuthenticateResponse {
  token: string; 
}

interface ActivateAccountResponse {
  message: string;
}

interface UserInfo{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string,
  imageUrl: string
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  file?: File; // Avatar file (optional)
}

interface UpdateProfileResponse {
  message: string;
  imageUrl?: string;
}
class AuthenticationService {
    async register(data: RegisterRequest): Promise<void> {
    try {
      const response = await api.post<void>('/auth/register', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  async activateAccount(token: string): Promise<ActivateAccountResponse> {
    try {
      const response = await api.get<ActivateAccountResponse>('/auth/activate-account', {
        params: {
          token: token
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Kích hoạt tài khoản không thành công. Vui lòng kiểm tra lại liên kết.";
      throw new Error(errorMessage);
    }
  }

   async authenticate(data: AuthenticateRequest): Promise<AuthenticateResponse> {
    try {
      const response = await api.post<AuthenticateResponse>('/auth/authenticate', data);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.";
      throw new Error(errorMessage);
    }
  }
   async getProfile(): Promise<UserInfo> {
    try {
      const response = await api.get('/user/profile');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.";
      throw new Error(errorMessage);
    }
  }
  
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const formData = new FormData();

      // Thêm các trường thông tin nếu có
      if (data.firstName) formData.append('firstName', data.firstName);
      if (data.lastName) formData.append('lastName', data.lastName);
      if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);

      // Thêm file ảnh nếu có
      if (data.file) formData.append('file', data.file);

      const response = await api.patch<UpdateProfileResponse>('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Cập nhật thông tin không thành công. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }
}
export const authenticationService = new AuthenticationService();
