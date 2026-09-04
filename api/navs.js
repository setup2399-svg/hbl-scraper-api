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
        const response = await fetch('https://www.mufap.com.pk/nav-attributes.php', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`MUFAP returned HTTP status ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
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
