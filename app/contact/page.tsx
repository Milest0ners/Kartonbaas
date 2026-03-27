import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactFormSection from '@/components/sections/ContactFormSection';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        <ContactFormSection />
      </main>
      <Footer />
    </>
  );
}
