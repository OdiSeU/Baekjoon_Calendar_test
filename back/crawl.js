const axios = require('axios');
const cheerio = require('cheerio');
const langs = require('./lang_data.json');

class BaekjoonCrawl {
    /**
     * Convert language string to language id
     * @param {string} lang 
     * @returns {number} language id
     */
    static getLangId(lang) {
        let id = Object.keys(this.langs).find(key => this.langs[key] === lang);
        console.log(id);
        if(id === undefined) throw `Language '${lang}' doesn't exist.`;
        return parseInt(id);
    }

    /**
     * Convert language id to language string
     * @param {number} id 
     * @returns {string} language string
     */
    static toLang(id) {
        let lang = this.langs[id];
        if(lang === undefined) throw `Language id '${id}' doesn't exist.`;
        return lang;
    }

    static crawl(query = {}, till='-1') {
        query = {
            'problem_id': query['problem_id'] || '',
            'user_id': query['user_id'] || '',
            'language_id': query['language_id'] || '-1',
            'result_id': query['result_id'] || '-1',
        };
        let url = `${this.host}/status?problem_id=${query.problem_id}&user_id=${query.user_id}&language_id=${query.language_id}&result_id=${query.result_id}`;
        return this.getData(url, till);
    }

    /**
     * 크롤링 함수
     * @param {*} url 
     * @param {string} till 
     * @returns 
     */
    static getData(url, till='-1') {
        console.log('Crawl ' + url);
        return axios.get(url).then(res => {
            const $ = cheerio.load(res.data);
            let data = [];
            let tr = $('#status-table > tbody > tr');
            for(let i=0; i < tr.length; i++) {
                data.push([]);
                let td = $(tr[i]).find('td');
                for(let j=0; j < td.length; j++) {
                    if(j==0 && $(td[j]).text() == till) {
                        data.pop();
                        return data;
                    }
                    if(j==8) data[i].push($(td[j]).children().attr('title'));
                    else data[i].push($(td[j]).text());
                }
            }

            let nextPath = $('#next_page').attr('href');
            if(nextPath) {
                return this.getData(this.host + nextPath, till)
                .then((item) => data.concat(item))
            }
            else return data;
        });
    }
}

BaekjoonCrawl.langs = langs;
BaekjoonCrawl.host = 'https://www.acmicpc.net';

module.exports = BaekjoonCrawl;