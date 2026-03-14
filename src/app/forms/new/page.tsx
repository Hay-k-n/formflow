import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';

export default function NewFormPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <FormBuilder />
      </main>
    </>
  );
}
