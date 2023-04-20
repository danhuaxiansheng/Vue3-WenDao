import { mapState } from 'vuex'
import { getLatestDays } from '@LIB/date'
import { setSessionParam } from "@PAGE/platform.js";
export default {
    computed: {
        ...mapState({
            keyword: state => state.onekeySearch.keyword,
            isExpression: state => state.onekeySearch.isExpression,
            timeRange: state => state.onekeySearch.timeRange,
            curPageUrl: state => state.onekeySearch.curPageUrl,
            timeSort: state => state.onekeySearch.timeSort,
        })
    },
    methods: {
        jumpDetail(pageInfo) {
            const pageUrl = pageInfo ? pageInfo.urlAddress : this.curPageUrl;
            let params = [{ field: 'time', value: '', op: 'range' }];

            switch (pageUrl) {
                case '/TZ/RiskDomain/StaticFeatures':
                    params = [];
                    break;
                case '/TZ/WebSheep/DubiousWebCheck':
                    params = [{ field: 'mintime', value: '', op: 'range' }];
                    break;
                case '/TZ/ClueVerification/IpSession':
                case '/TZ/ClueVerification/DnsResolut':
                case '/TZ/ClueVerification/HttpMetadata':
                case '/TZ/ClueVerification/SipMeta':
                case '/TZ/ClueVerification/DiameteMeta':
                    params = [{ field: '@createtime', value: '', op: 'range' }];
                    break;
            }
            // 需求：最长只能查最近30天
            if (this.timeRange) {
                params[0].value = this.timeRange.join(" - ");
            } else {
                let baseD = getLatestDays(30),
                    sTime = baseD.t2 + " 00:00:00",
                    eTime = baseD.t1 + " 23:59:59";
                params[0].value = `${sTime} - ${eTime}`;
            }
            // 跳转参数
            let jumpParams = {
                conditions: params,
                expression: ""
            }
            if (pageInfo) {
                jumpParams.expression = '{"query":{"term":{"_id":"' + pageInfo.indexid + '"}}}'
            } else {
                if (this.isExpression) {
                    jumpParams.expression = this.keyword
                } else {
                    jumpParams.conditions.push({
                        op: 'equal',
                        field: 'keywords',
                        value: this.isExpression ? "" : this.keyword
                    })
                }
            }


            // 跳转
            setSessionParam({
                isJson: true,
                type: '_blank',
                url: pageUrl,
                sessionName: 'paramListSession',
                data: jumpParams
            });
        },
    }
}