import { PatientAuthProvider } from '@/contexts/PatientAuthContext';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientAuthProvider>
      {children}
    </PatientAuthProvider>
  );
}