/**
 * Mapping of country names to their international dialing codes
 * Based on ITU-T E.164 international calling codes
 */
export const COUNTRY_PHONE_CODES: Record<string, string> = {
  // Americas
  'Argentina': '+54',
  'Bahamas': '+1-242',
  'Barbados': '+1-246',
  'Belize': '+501',
  'Bolivia': '+591',
  'Brazil': '+55',
  'Canada': '+1',
  'Chile': '+56',
  'Colombia': '+57',
  'Costa Rica': '+506',
  'Dominican Republic': '+1-809',
  'Ecuador': '+593',
  'El Salvador': '+503',
  'Guatemala': '+502',
  'Guyana': '+592',
  'Honduras': '+504',
  'Jamaica': '+1-876',
  'Mexico': '+52',
  'Nicaragua': '+505',
  'Panama': '+507',
  'Paraguay': '+595',
  'Peru': '+51',
  'Puerto Rico': '+1-787',
  'Suriname': '+597',
  'Trinidad and Tobago': '+1-868',
  'United States': '+1',
  'Uruguay': '+598',
  'Venezuela': '+58',
  
  // Europe
  'Albania': '+355',
  'Austria': '+43',
  'Belarus': '+375',
  'Belgium': '+32',
  'Bosnia and Herzegovina': '+387',
  'Bulgaria': '+359',
  'Croatia': '+385',
  'Cyprus': '+357',
  'Czech Republic': '+420',
  'Denmark': '+45',
  'Estonia': '+372',
  'Finland': '+358',
  'France': '+33',
  'Germany': '+49',
  'Greece': '+30',
  'Hungary': '+36',
  'Iceland': '+354',
  'Ireland': '+353',
  'Italy': '+39',
  'Latvia': '+371',
  'Liechtenstein': '+423',
  'Lithuania': '+370',
  'Luxembourg': '+352',
  'Malta': '+356',
  'Moldova': '+373',
  'Monaco': '+377',
  'Montenegro': '+382',
  'Netherlands': '+31',
  'North Macedonia': '+389',
  'Norway': '+47',
  'Poland': '+48',
  'Portugal': '+351',
  'Romania': '+40',
  'Serbia': '+381',
  'Slovakia': '+421',
  'Slovenia': '+386',
  'Spain': '+34',
  'Sweden': '+46',
  'Switzerland': '+41',
  'Ukraine': '+380',
  'United Kingdom': '+44',
  
  // APAC
  'Afghanistan': '+93',
  'Australia': '+61',
  'Bangladesh': '+880',
  'Brunei': '+673',
  'Cambodia': '+855',
  'China': '+86',
  'Fiji': '+679',
  'Hong Kong': '+852',
  'India': '+91',
  'Indonesia': '+62',
  'Japan': '+81',
  'Kazakhstan': '+7',
  'Laos': '+856',
  'Macau': '+853',
  'Malaysia': '+60',
  'Maldives': '+960',
  'Mongolia': '+976',
  'Myanmar': '+95',
  'Nepal': '+977',
  'New Zealand': '+64',
  'Pakistan': '+92',
  'Philippines': '+63',
  'Singapore': '+65',
  'South Korea': '+82',
  'Sri Lanka': '+94',
  'Taiwan': '+886',
  'Thailand': '+66',
  'Uzbekistan': '+998',
  'Vietnam': '+84',
  
  // Middle East & Africa
  'Algeria': '+213',
  'Angola': '+244',
  'Bahrain': '+973',
  'Benin': '+229',
  'Botswana': '+267',
  'Burkina Faso': '+226',
  'Cameroon': '+237',
  'Central African Republic': '+236',
  'Chad': '+235',
  'Democratic Republic of Congo': '+243',
  'Djibouti': '+253',
  'Egypt': '+20',
  'Eritrea': '+291',
  'Eswatini': '+268',
  'Ethiopia': '+251',
  'Gabon': '+241',
  'Gambia': '+220',
  'Ghana': '+233',
  'Guinea': '+224',
  'Iran': '+98',
  'Iraq': '+964',
  'Israel': '+972',
  'Ivory Coast': '+225',
  'Jordan': '+962',
  'Kenya': '+254',
  'Kuwait': '+965',
  'Lebanon': '+961',
  'Lesotho': '+266',
  'Liberia': '+231',
  'Libya': '+218',
  'Madagascar': '+261',
  'Malawi': '+265',
  'Mali': '+223',
  'Mauritius': '+230',
  'Morocco': '+212',
  'Mozambique': '+258',
  'Namibia': '+264',
  'Niger': '+227',
  'Nigeria': '+234',
  'Oman': '+968',
  'Palestine': '+970',
  'Qatar': '+974',
  'Republic of Congo': '+242',
  'Rwanda': '+250',
  'Saudi Arabia': '+966',
  'Senegal': '+221',
  'Sierra Leone': '+232',
  'Somalia': '+252',
  'South Africa': '+27',
  'South Sudan': '+211',
  'Sudan': '+249',
  'Syria': '+963',
  'Tanzania': '+255',
  'Togo': '+228',
  'Tunisia': '+216',
  'Turkey': '+90',
  'Uganda': '+256',
  'United Arab Emirates': '+971',
  'Yemen': '+967',
  'Zambia': '+260',
  'Zimbabwe': '+263',
  
  // Default for "Other"
  'Other': '+',
};

/**
 * Get the phone code for a specific country
 */
export const getCountryPhoneCode = (country: string): string => {
  return COUNTRY_PHONE_CODES[country] || '+';
};

/**
 * Parse a phone number to extract country code and local number
 */
export const parsePhoneNumber = (phoneNumber: string): { countryCode: string; localNumber: string } => {
  // Remove all non-digit characters except the leading +
  const cleaned = phoneNumber.trim();
  
  if (cleaned.startsWith('+')) {
    // Try to extract country code (up to 4 digits after +)
    const match = cleaned.match(/^\+(\d{1,4})/);
    if (match) {
      const countryCode = `+${match[1]}`;
      const localNumber = cleaned.substring(countryCode.length).trim();
      return { countryCode, localNumber };
    }
  }
  
  return { countryCode: '+', localNumber: cleaned };
};
