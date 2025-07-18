
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activationStatus, setActivationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if there's a token in URL params (for email link activation)
  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    // If token is provided in URL, auto-activate
    if (tokenFromUrl) {
      handleActivation(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleActivation = async (token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Call the activation endpoint
      const response = await fetch(`/auth/activate-account?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setActivationStatus('success');
        toast({
          title: "Kích hoạt thành công!",
          description: "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.",
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.text();
        setActivationStatus('error');
        setErrorMessage(errorData || 'Có lỗi xảy ra khi kích hoạt tài khoản');
        toast({
          title: "Kích hoạt thất bại",
          description: "Mã kích hoạt không hợp lệ hoặc đã hết hạn.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setActivationStatus('error');
      setErrorMessage('Không thể kết nối đến máy chủ');
      toast({
        title: "Lỗi kết nối",
        description: "Vui lòng kiểm tra kết nối internet và thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      handleActivation(otp);
    }
  };

  const handleResendActivation = async () => {
    // This would typically call a resend activation endpoint
    toast({
      title: "Đã gửi lại email",
      description: "Vui lòng kiểm tra hộp thư của bạn.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BookConnect
              </h1>
            </div>
          </div>
          <p className="text-gray-600">Kích hoạt tài khoản của bạn</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6 text-center">
            {activationStatus === 'success' ? (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Kích hoạt thành công!</CardTitle>
                <CardDescription>
                  Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
                </CardDescription>
              </>
            ) : activationStatus === 'error' ? (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600">Kích hoạt thất bại</CardTitle>
                <CardDescription>
                  Không thể kích hoạt tài khoản của bạn. Vui lòng thử lại.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Kích hoạt tài khoản</CardTitle>
                <CardDescription>
                  {tokenFromUrl 
                    ? "Đang xử lý kích hoạt tài khoản..."
                    : "Nhập mã kích hoạt 6 chữ số được gửi đến email của bạn"
                  }
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {activationStatus === 'idle' && !tokenFromUrl && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleOtpSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={otp.length !== 6 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Kích hoạt tài khoản'
                    )}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Không nhận được mã?
                  </p>
                  <Button
                    variant="ghost"
                    onClick={handleResendActivation}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    Gửi lại mã kích hoạt
                  </Button>
                </div>
              </>
            )}

            {activationStatus === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Thử lại
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleResendActivation}
                    className="flex-1 text-blue-600 hover:text-blue-800"
                  >
                    Gửi lại mã
                  </Button>
                </div>
              </div>
            )}

            {activationStatus === 'success' && (
              <div className="text-center space-y-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Đến trang đăng nhập
                </Button>
              </div>
            )}

            {isLoading && tokenFromUrl && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang kích hoạt tài khoản...</span>
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Quay lại{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Đăng nhập
                </Link>
                {' '}hoặc{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Đăng ký
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivateAccount;
