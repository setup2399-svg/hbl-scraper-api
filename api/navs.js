const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const response = await axios.get('https://www.mufap.com.pk/nav-attributes.php', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) Mobile' }
        });

        const $ = cheerio.load(response.data);
        const funds = [];

        $('tr').each((i, row) => {
            const text = $(row).text();
            if (text.includes('HBL')) {
                const cols = $(row).find('td');
                if (cols.length >= 3) {
                    const fundName = $(cols[0]).text().trim();
                    const category = $(cols[1]).text().trim();
                    const navVal = parseFloat($(cols[2]).text().replace(/,/g, '').trim());

                    if (fundName && !isNaN(navVal)) {
                        funds.push({ name: fundName, category, nav: navVal });
                    }
                }
            }
        });

        res.status(200).json({ success: true, timestamp: new Date().toISOString(), data: funds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

