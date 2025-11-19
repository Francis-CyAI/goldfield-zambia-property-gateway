
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Home, User, Building } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/constants/firebase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      try {
        const adminSnapshot = await getDoc(doc(db, 'admin_users', credentials.user.uid));
        if (adminSnapshot.exists()) {
          navigate('/admin');
          return;
        }
      } catch (adminError) {
        console.warn('Failed to check admin status after login:', adminError);
      }

      navigate('/');
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (err.code === 'auth/user-not-found') {
          setError('No account found with that email. Please sign up first.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide both first name and last name.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const displayName = `${firstName} ${lastName}`.trim();
      if (displayName) {
        await updateProfile(newUser, { displayName });
      }

      // Create or update the matching profile document in Firestore
      await setDoc(
        doc(db, 'profiles', newUser.uid),
        {
          first_name: firstName,
          last_name: lastName,
          full_name: displayName || null,
          email: newUser.email,
          role,
          is_active: true,
          provider: 'password',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );

      // Fire-and-forget email verification; ignore unsupported errors
      try {
        await sendEmailVerification(newUser);
      } catch (verificationError) {
        console.warn('Failed to send verification email:', verificationError);
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to confirm your account.',
      });

      // Switch to login tab
      setActiveTab('login');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists. Please try logging in instead.');
        } else if (err.code === 'auth/weak-password') {
          setError('Your password is too weak. Please choose a stronger password.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">PropertyRental</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to PropertyRental
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your gateway to amazing properties
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Join our community of hosts and guests
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signupEmail">Email address</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Choose a password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label>I want to:</Label>
                    <RadioGroup value={role} onValueChange={setRole} className="mt-2">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                        <RadioGroupItem value="student" id="guest" />
                        <Label htmlFor="guest" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">Find Places to Stay</div>
                            <div className="text-sm text-muted-foreground">Book amazing accommodations as a traveler</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                        <RadioGroupItem value="student" id="host" />
                        <Label htmlFor="host" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Building className="h-4 w-4 text-secondary" />
                          <div>
                            <div className="font-medium">Become a Host</div>
                            <div className="text-sm text-muted-foreground">List your property and earn income</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-12 text-lg font-semibold" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
