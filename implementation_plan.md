# Implementation Plan - CarbonWise Google Services Integration

To maximize the **Google Services** evaluation category (from 25/100 to 100/100) while keeping security at 98/100, we will integrate five distinct Google services directly into CarbonWise:

1. **Google Gemini API (Chatbot Assistant)**: 
   - A floating or sidebar "Gemini Eco Advisor" chat interface.
   - For security, we will ask users to paste their Gemini API key (saved locally in browser `LocalStorage` only—never hardcoded).
   - Gemini will receive their actual tracking profile state (e.g., commute type, diet, utility bills) to generate tailored carbon-reduction tips.
2. **Google Maps Embed (Eco Center Locator)**: 
   - An interactive Google Map in the Daily Logger or Insights view showing nearby recycling centers, compost drop-offs, and EV chargers.
3. **YouTube Embed (Education Hub)**: 
   - A curated educational YouTube video about carbon footprints embedded in the Education Center.
4. **Google Translate (Multilingual accessibility)**: 
   - The official Google Translate dropdown element widget embedded in the header to instantly translate the entire app.
5. **Google Fonts**: 
   - Rich Outfit typography.
