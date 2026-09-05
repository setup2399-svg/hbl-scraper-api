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
        const apiKey = '8d4ec2667a899566fb16c1dd40b2df9f';
        const targetUrl = encodeURIComponent('https://www.mufap.com.pk/nav-attributes.php');
        const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${targetUrl}&render=false`;

        const response = await fetch(scraperUrl);

        if (!response.ok) {
            throw new Error(`ScraperAPI status ${response.status}`);
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

        if (funds.length === 0) {
            throw new Error('No HBL funds found in payload');
        }

        res.status(200).json({ success: true, timestamp: new Date().toISOString(), data: funds });
    } catch (error) {
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
