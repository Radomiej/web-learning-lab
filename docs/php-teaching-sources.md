# Podstawy PHP i formularze — źródła i zakres

20 października 2026. Autorskie polskie wyjaśnienia i przykłady; bez kopiowania kursu.

W3Schools wykorzystano jako punkt odniesienia do kolejności: składnia, zmienne, decyzje, pętle, tablice, funkcje, formularz i walidacja:

- https://www.w3schools.com/php/php_intro.asp
- https://www.w3schools.com/php/php_syntax.asp
- https://www.w3schools.com/php/php_forms.asp
- https://www.w3schools.com/php/php_form_validation.asp
- https://www.w3schools.com/php/php_superglobals_get.asp
- https://www.w3schools.com/php/php_superglobals_post.asp

Źródła właściwej semantyki i bezpieczeństwa (oficjalny podręcznik PHP):

- https://www.php.net/manual/en/reserved.variables.post.php — formularzowe typy treści, tablica $_POST; nie utożsamiamy jej z JSON.
- https://www.php.net/manual/en/function.htmlspecialchars.php — kodowanie tekstu przy wyjściu do HTML, ENT_QUOTES, UTF-8.

Ograniczenie lokalnego silnika potwierdzono w src/services/phpRuntime.js oraz phpPreview.js: zwykłe Play używa php.run, testy phpRequest używają handler.request z przygotowanymi danymi. Dokument podglądu jest zbudowany z wyniku; nie dodano obsługi natywnego submit do wirtualnego endpointu. Materiał odróżnia model serwera PHP od testowania żądania w labie.

Moduł zawiera 34 strony dla ośmiu istniejących lekcji i osiem dokładnych diagramów SVG. Generator: scripts/generate-php-teaching-assets.mjs. Weryfikację importu, build i testy prowadzi agent integrujący, sekwencyjnie zgodnie z AGENTS.md. Audyt źródła diagramu nie zastępuje testu stron w przeglądarce.
