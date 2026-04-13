import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth.store';
import { Heart } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        await login(credentialResponse.credential);
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Wearable Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            웨어러블 기기 건강 데이터를 한눈에 확인하세요
          </p>
        </div>

        <div className="flex justify-center">
          {isLoading ? (
            <div className="text-sm text-gray-500">로그인 중...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.error('Google login error')}
              theme="outline"
              size="large"
              width="320"
            />
          )}
        </div>
      </div>
    </div>
  );
}
