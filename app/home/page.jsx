import Hero from "../components/hero.jsx";
import NavbarComponent from "../components/navbar.jsx";
import ContactForm from "../components/ContactForm.jsx";
import Footer from "../components/Footer.jsx";

export default function Front() {
  return (
    <>
      <NavbarComponent />
      <Hero/>
      <ContactForm />
      <Footer />
    </>
  );
}
