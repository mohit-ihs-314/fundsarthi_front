import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppSupport() {
  const phoneNumber = "919971333431";

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${phoneNumber}?text=Hi%20Fundsarthi%20Support`,
      "_blank"
    );
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-25 right-5 z-[9999] w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl flex items-center justify-center animate-pulse"
    >
      <FaWhatsapp className="w-7 h-7" />
    </button>
  );
}