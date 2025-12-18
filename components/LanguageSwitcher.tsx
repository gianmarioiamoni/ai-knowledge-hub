"use client";

import { JSX } from "react";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

function LanguageSwitcher(): JSX.Element {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `preferred_locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const targetPath = pathname || "/";
    router.push(targetPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Change language"
        >
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-base">{currentLanguage?.flag ?? "🌐"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={language.code === locale ? "bg-accent" : ""}
          >
            <span className="mr-2 text-base">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LanguageSwitcher };

