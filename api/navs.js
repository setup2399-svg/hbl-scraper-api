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
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.mufap.com.pk/',
                'Cache-Control': 'no-cache'
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
        // Fallback demo data so your mobile app interface stays functional even if MUFAP blocks the IP
        res.status(200).json({
            success: true,
            isFallback: true,
            error: error.message,
            data: [
                { name: 'HBL Cash Fund', category: 'Money Market', nav: 103.59 },
                { name: 'HBL Islamic Money Market Fund', category: 'Islamic Money Market', nav: 105.02 },
                { name: 'HBL Income Fund', category: 'Income', nav: 121.23 },
                { name: 'HBL Stock Fund', category: 'Equity', nav: 240.13 }
            ]
        });
    }
};
