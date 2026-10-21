import React from 'react';

interface SocialIconsProps {
  email?: string;
  linkTreeUrl?: string;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({
  email = 'SingaporeEFministries@gmail.com',
  linkTreeUrl = 'https://linktr.ee/efmasscommunitysingapore',
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Telegram */}
      <a
        href="https://t.me/singaporeefcommunity"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.894-1.284 5.76-1.854 8.271-.24.894-.57 1.194-.888 1.224-.693.063-1.221-.459-1.893-.899-1.053-.69-1.647-1.12-2.67-1.794-1.182-.779-.417-1.206.258-1.908.177-.183 3.246-2.973 3.306-3.228.008-.032.015-.152-.057-.216s-.177-.042-.253-.025c-.108.025-1.827 1.164-5.157 3.412-.489.336-.933.501-1.332.492-.441-.01-1.29-.25-1.92-.455-.774-.252-1.39-.387-1.335-.816.029-.224.336-.453.921-.69 3.606-1.572 6.012-2.607 7.218-3.105 3.438-1.422 4.152-1.671 4.617-1.677.102-.001.33.025.477.145.126.102.162.24.177.339-.001.072.012.288-.009.43z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
        </svg>
      </a>

      {/* Email */}
      <a
        href={`mailto:${email}`}
        aria-label="Email"
        title={`Email: ${email}`}
        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 19V7.183l10 8.104 10-8.104V19H2z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href="https://chat.whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </a>
    </div>
  );
};
