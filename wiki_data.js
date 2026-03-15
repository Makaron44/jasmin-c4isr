/**
 * JASMIN C4ISR – JasminWiki Data
 * Kompendium wiedzy o jednostkach i taktyce
 */

const WIKI_DATA = {
    'KTO Rosomak': {
        role: 'Kołowy Transporter Opancerzony',
        description: 'Podstawowy środek transportu i wsparcia piechoty zmechanizowanej. Wyposażony w armatę 30mm Bushmaster II.',
        tactics: 'Wykorzystuj wysoką mobilność (Prędkość 2). Najskuteczniejszy w terenie mieszanym i zurbanizowanym. Unikaj bezpośredniego starcia z czołgami OPFOR.',
        features: ['Wysoka mobilność', 'Zbalansowany pancerz', 'Skuteczny vs Piechota']
    },
    'Leopard 2PL': {
        role: 'Czołg Podstawowy (MBT)',
        description: 'Główna siła uderzeniowa Wojsk Lądowych. Najwyższa odporność i siła ognia w arsenale PL.',
        tactics: 'Używaj do przełamywania linii umocnionych. W lesie (Osłona 40%) jest niemal nie do przebicia dla standardowych jednostek.',
        features: ['Potężny pancerz', 'Wysoka siła ognia', 'Niska prędkość']
    },
    'AHS Krab': {
        role: 'Samobieżna Armatohaubica 155mm',
        description: 'System artyleryjski dalekiego zasięgu. Kluczowy element wsparcia ogniowego.',
        tactics: 'Umięszczaj na tyłach, najlepiej w pobliżu FOB. Posiada zasięg 6 pól, co pozwala razić cele bez narażania się na ogień bezpośredni.',
        features: ['Ekstremalny zasięg (6)', 'Wysokie obrażenia obszarowe', 'Bardzo wrażliwy na atak bezpośredni']
    },
    'Rozpoznanie': {
        role: 'Sekcja Rozpoznawcza / Żmija',
        description: 'Lekkie pojazdy przeznaczone do wykrywania pozycji nieprzyjaciela i wskazywania celów dla artylerii.',
        tactics: 'Prowadź rozpoznanie z dużej odległości (Zasięg obserwacji 5). Nie wdawaj się w walkę – ich rolą jest "widzieć", nie "bić".',
        features: ['Największy zasięg wzroku (5)', 'Duża prędkość', 'Minimalny pancerz']
    },
    'Spike ATGM': {
        role: 'Wyrzutnia Przeciwpancernych Pocisków Kierowanych',
        description: 'Specjalistyczna jednostka ppanc zdolna do niszczenia najcięższych czołgów z bezpiecznej odległości.',
        tactics: 'Zasadzki w lasach lub miastach. Rakety Spike ignorują dużą część pancerza przeciwnika.',
        features: ['Wysoka przebijalność', 'Zasięg 4', 'Niska wytrzymałość']
    },
    'Cysterna': {
        role: 'Wsparcie Logistyczne (Paliwo)',
        description: 'Mobilna stacja paliw (Jelcz 442). Kluczowa dla utrzymania tempa natarcia jednostek pancernych.',
        tactics: 'Trzymaj 1 pole za nacierającymi czołgami. Cysterna automatycznie tankuje sąsiednie jednostki PL na koniec każdej tury.',
        features: ['Pasywne tankowanie', 'Brak uzbrojenia', 'Wymaga eskorty']
    },
    'FlyEye': {
        role: 'Bezzałogowy System Powietrzny (BSL)',
        description: 'Dron rozpoznawczy klasy mini. Zapewnia podgląd pola walki w czasie rzeczywistym.',
        tactics: 'Wykorzystuj do lotów nad terytorium OPFOR. Dzięki dużej prędkości (5) może szybko sprawdzić "mgłę wojny".',
        features: ['Ignoruje teren', 'Zasięg wzroku 6', 'Bardzo szybki']
    },
    'Radar Liwiec': {
        role: 'Radar Artyleryjski',
        description: 'System wykrywania stanowisk ogniowych artylerii przeciwnika.',
        tactics: 'Automatycznie nanosi na mapę pozycje wrogich AHS po ich strzale. Niezbędny do prowadzenia skutecznego ognia kontrbateryjnego.',
        features: ['Wykrywanie artylerii', 'Brak uzbrojenia', 'Klucz do ognia kontrbateryjnego']
    },
    'Wóz Inż': {
        role: 'Inżynieria Polowa',
        description: 'Jednostka wsparcia inżynieryjnego. Odpowiada za zapory minowe i naprawę przepraw.',
        tactics: 'Ustawiaj pola minowe w wąskich gardłach. Naprawiaj mosty, aby umożliwić przeprawę ciężkiego sprzętu przez rzeki.',
        features: ['Stawianie min', 'Naprawa mostów', 'Wsparcie saperskie']
    },
    'Wóz Dowodzenia': {
        role: 'Mobilne Stanowisko Dowodzenia (HQ)',
        description: 'Zapewnia koordynację działań i dostęp do wsparcia lotniczego.',
        tactics: 'Jego obecność na mapie pozwala na używanie przycisku "LOTNICTWO". Jeśli HQ zostanie zniszczone, tracisz wsparcie z powietrza.',
        features: ['Zarządzanie wsparciem lotniczym', 'Wysokie morale', 'Cel priorytetowy dla OPFOR']
    },
    'FOB Rogoźno': {
        role: 'Baza Operacyjna (Forward Operating Base)',
        description: 'Główny punkt logistyczny i dowodzenia w sektorze.',
        tactics: 'Nieruchoma. Jednostki w zasięgu 2 pól od FOB są automatycznie uzupełniane i naprawiane.',
        features: ['Nieruchoma', 'Gigantyczna wytrzymałość', 'Punkt napraw i zaopatrzenia']
    },
    'T-72': {
        role: 'Czołg Podstawowy OPFOR',
        description: 'Główny czołg sił przeciwnika. Solidny, ale ustępuje nowoczesnym Leopardom pod względem optyki.',
        tactics: 'Zwalczaj z dystansu lub za pomocą Spike. W zwarciu T-72 nadal stanowi poważne zagrożenie dla Rosomaków.',
        features: ['Silny pancerz', 'Zagrożenie bezpośrednie', 'Standardowy zasięg 3']
    },
    'BMP-2': {
        role: 'Bojowy Wóz Piechoty OPFOR',
        description: 'Szybki i niebezpieczny pojazd z działkiem 30mm i wyrzutnią ppanc.',
        tactics: 'Priorytetowy cel dla Rosomaków. Uwaga na ich pociski kierowane, które mogą uszkodzić nawet czołgi.',
        features: ['Wszechstronny', 'Szybki', 'Słaby pancerz boczny']
    },
    'Mi-24': {
        role: 'Śmigłowiec Szturmowy OPFOR',
        description: 'Latający czołg przeciwnika. Największe zagrożenie mobilne w symulacji.',
        tactics: 'Wymaga skupienia ognia kilku jednostek. FlyEye może pomóc w jego wczesnym wykryciu.',
        features: ['Ignoruje teren', 'Wysoka siła ognia', 'Bardzo mobilny']
    },
    'Mina': {
        role: 'Zapora Minowa',
        description: 'Ukryte zagrożenie na polu walki. Aktywuje się po wjechaniu na pole.',
        tactics: 'Omijaj pola podejrzane o zaminowanie lub wysyłaj Wóz Inż do ich neutralizacji.',
        features: ['Ukryte', 'Zniszczalne', 'Zadaje duże obrażenia podwozia']
    },
    'Artyleria': {
        role: 'Artyleria OPFOR',
        description: 'Wrogie systemy rakietowe i lufowe.',
        tactics: 'Używaj Radaru Liwiec do wyznaczania celów dla własnych Krabów (ogień kontrbateryjny).',
        features: ['Długi zasięg', 'Atak pośredni', 'Wymaga zniszczenia przez Kraby']
    },
    'SPZR Poprad': {
        role: 'Samobieżny Przeciwlotniczy Zestaw Rakietowy',
        description: 'System obrony powietrznej bardzo krótkiego zasięgu (VSHORAD). Wyposażony w rakiety Grom/Piorun.',
        tactics: 'Rozstawiaj w pobliżu kluczowych zgrupowań pancernych. Poprad automatycznie przechwytuje wrogie śmigłowce (Mi-24) w zasięgu 5 pól.',
        features: ['Automatyczna obrona przeciwlotnicza', 'Wysoka mobilność', 'Zasięg 5']
    },
    'ZSU-23-4 Szyłka': {
        role: 'Samobieżne Działo Przeciwlotnicze OPFOR',
        description: 'Cztero-lufowy system przeciwlotniczy. Groźny cel zarówno dla dronów, jak i lekko opancerzonych pojazdów.',
        tactics: 'Priorytetowy cel dla Twoich czołgów. Zasięg 4 i wysoka szybkostrzelność czynią ją zabójczą dla jednostek takich jak Żmija czy FlyEye.',
        features: ['Ogień przeciwlotniczy', 'Wysoki DMG vs technika lekka', 'Zasięg 4']
    },
    'Jelcz 882 (Amunicja)': {
        role: 'Mobilny Wóz Amunicyjny',
        description: 'Specjalistyczny pojazd logistyczny zaopatrujący jednostki bojowe w środki bojowe (ŚSP).',
        tactics: 'Niezbędny przy bateriach Krabów i Langust. Automatycznie uzupełnia amunicję (+20) sąsiednim jednostkom co turę.',
        features: ['Regeneracja AMUNICJI', 'Brak własnego uzbrojenia', 'Klucz do wsparcia artyleryjskiego']
    },
    'Rosomak-WEM': {
        role: 'Wóz Ewakuacji Medycznej',
        description: 'Jednostka wsparcia medycznego przeznaczona do opatrywania rannych i podnoszenia morale na linii frontu.',
        tactics: 'Trzymaj w drugiej linii natarcia. Każda tura spędzona obok WEM przywraca jednostkom punkty życia (+15) i morale (+10%).',
        features: ['Regeneracja HP', 'Bonus do Morale', 'Solidny pancerz kadłuba']
    },
    'Warmate': {
        role: 'Amunicja Krążąca (Kamikaze)',
        description: 'Dron uderzeniowy zdolny do precyzyjnego niszczenia celów poprzez bezpośrednie uderzenie.',
        tactics: 'Broń jednorazowa. Wyślij go na najtwardszy cel (np. T-72) – eksplozja po trafieniu niszczy drona, ale zadaje ogromne obrażenia (80+).',
        features: ['Jednorazowego użytku', 'Ekstremalne obrażenia', 'Bardzo szybki (5)']
    },
    'Sekcja Snajperska': {
        role: 'Strzelcy Wyborowi Wojsk Specjalnych',
        description: 'Elitarna sekcja przeznaczona do precyzyjnej eliminacji celów i prowadzenia dyskretnej obserwacji.',
        tactics: 'Niewidzialni dla wroga (stealth), dopóki nie zostaną wykryci z bliska (1 pole) lub nie oddadzą strzału. Idealni do zasadzek.',
        features: ['Niewidzialność (Stealth)', 'Wysoki zasięg wzroku (6)', 'Precyzyjny ogień (Range 4)']
    },
    'WR-40 Langusta': {
        role: 'Wyrzutnia Rakietowa',
        description: 'Wieloprowadnicowy system rakietowy przeznaczony do rażenia celów powierzchniowych.',
        tactics: 'Prowadzi ostrzał obszarowy (Salwa). Trafienie w cel powoduje obrażenia również na wszystkich 8 sąsiednich polach (efekt obszarowy 3x3).',
        features: ['Atak obszarowy 3x3', 'Zasięg 8', 'Bardzo wysokie zużycie amunicji']
    },
    'BM-21 Grad': {
        role: 'Wieloprowadnicowa Wyrzutnia Rakietowa OPFOR',
        description: 'Podstawowy system artylerii rakietowej przeciwnika.',
        tactics: 'Analogicznie do Langusty, Grad zadaje obrażenia obszarowe. Rozpraszaj swoje jednostki, aby salwa nie trafiła kilku wozów naraz.',
        features: ['Atak obszarowy 3x3', 'Mobilność', 'Zasięg 8']
    },
    'Bunkier': {
        role: 'Umocnienie Polowe / Fortyfikacja',
        description: 'Stała konstrukcja obronna zapewniająca ekstremalną ochronę załodze.',
        tactics: 'Ustawiany w edytorze. Jednostka w bunkrze ma 90% pancerza, co czyni ją prawie niezniszczalną dla ognia bezpośredniego.',
        features: ['Nieruchomy', 'Pancerz 90', 'Ogromna pula HP']
    }
};
