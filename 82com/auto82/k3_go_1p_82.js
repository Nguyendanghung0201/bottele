const db = require('../db/db');
const axios = require('axios')

axios.defaults.timeout = 14000;


let table = "users_telegram_k3go"

const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
let bonhotam = {

}
let data_loi_nhuan = {

}

let data_tong_tien_cuoc = {
}
let so_du_hien_tai = {

}
let so_du_ban_dau = {

}
let data_bet = {

}

let chienluocvon_index = 0
let phien_thu = []

async function guigaytoicacuser(len, bot) {
    let list = await db(table).select("*").where('doigay', 'on').andWhere('k3go1', 1)
    await db(table).update('doigay', 'off').where('doigay', 'on').andWhere('k3go1', 1)
    for (let el of list) {
        bot.sendMessage(el.chatId, `🔂 Tín hiệu đã gãy K3-GO 1 phút, bắt đầu copy tín hiệu
Entry: 0
Len: ${len}`)
        await delay(300)
    }
}
const moment = require('moment-timezone');
function getCurrentTime() {
    const now = new Date();

    // Lấy giờ và phút
    const currentTimeHanoi = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm');

    return currentTimeHanoi;
}
async function tonghopphien(data_copy, gay, tim_kiem, tinhieu, bot) {
    try {
        let list = await db("lichsu_ma_group").select('*').where("session", tim_kiem.session)
        let lo = 0
        let lai = 0
        for (let item of list) {

            if (item.dudoan == item.xoso) {
                lai = lai + item.betcount
            } else {
                lo = lo + item.betcount
            }
        }
        let currentTime = getCurrentTime();

        await db("lichsu_tong_hop").insert({
            group_id: data_copy.id_group,
            sophien: list.length,
            lo: lo,
            lai: lai,
            session: tim_kiem.session,
            type: 'k3go1',
            "currentTime": currentTime
        })
        let sophien = data_copy.sophien ? data_copy.sophien : 50;
        let result = await db("lichsu_tong_hop").select('*')
            .where('group_id', data_copy.id_group).andWhere("type", 'k3go1')
            .orderBy('id', 'desc')
            .paginate({ perPage: sophien, currentPage: 1 });
        let list_send = result.data
        let total = result.pagination.total

        let text = `❇️ 𝐓𝐡ố𝐧𝐠 𝐤ê ${list_send.length} 𝐩𝐡𝐢ê𝐧 𝐠ầ𝐧 𝐧𝐡ấ𝐭  ....
    
`;
        let sophien_ban_dau = total - list_send.length + 1
        for (let item of list_send.reverse()) {

            let soduong = Math.round((item.lai * 0.96 - item.lo) * 100) / 100

            text = text + `🕗 ${item.currentTime}: Phiên ${sophien_ban_dau} -${soduong > 0 ? " -THẮNG 🟢" : "THUA 🟡"}  ${soduong}\n`
            sophien_ban_dau = sophien_ban_dau + 1
        }

        text = text + `
    
    ${data_copy.datatext}`

        bot.sendMessage(data_copy.id_group, text, {
            parse_mode: "HTML"
        })
    } catch (e) {
        console.log('tonghopphien err : ', e)
    }

}


function getTime_now() {
    const currentTime = new Date();

    // Thêm 7 giờ (7 * 60 * 60 * 1000 milliseconds) để có múi giờ +7
    const adjustedTime = new Date(currentTime.getTime() + 7 * 60 * 60 * 1000);

    // Lấy timestamp từ đối tượng Date
    const timestamp = Math.floor(adjustedTime.getTime() / 1000);
    return timestamp
}
let token = "";

async function callapi(url, pt, headers, body) {
    try {
        let result = false
        if (pt == 'get') {
            result = await axios.get(url, {
                headers: headers,
            })
        } else {
            result = await axios.post(url, body, {
                headers: headers,
            })
        }



        if (result && result.status == 200) {

            if (result.data.code == 200 && result.data.message == "Successful!") {

                return result.data.data
            }

        }

        return result
    } catch (e) {
        console.log('calll api loi r ',e)
        return false
    }

}

async function getToken() {
    let resher = true
    try {
        let body = {
            "username": "0991455506",
            "password": "111222"
        };
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + token,
        };
        tk_hethong = await callapi("https://88lotte.com/api/token/refresh", 'get', headers, body)
        if (tk_hethong && tk_hethong.access_token) {
            token = tk_hethong.access_token
        }
    } catch (e) {

        resher = false
    }

    if (resher == false) {
        let body = {
            "username": "0991455506",
            "password": "111222"
        };
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",

        };
        tk_hethong = await callapi("https://88lotte.com/api/login", 'post', headers, body)
        if (tk_hethong && tk_hethong.access_token) {
            token = tk_hethong.access_token
        }
    }
}

async function test(bot) {
    let timeout = 1000
    console.log('bat dau cahy')

    try {
        const url = new URL(
            "https://88lotte.com/api/game/current/k3"
        );

        const params = {
            "type": 1,
        }

        Object.keys(params)
            .forEach(key => url.searchParams.append(key, params[key]));
        let pt = "get"

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + token,
        };

        let data = await callapi(url, pt, headers, {})


        if (data && data.id) {

            const timeToWait = data.time_remaining;


            if (timeToWait > 30) {
                //  gọi hàm đặt cược


                await check_dk(data.id, bot)
            }
            if (timeToWait > 0) {

                // Sử dụng setTimeout để đợi đến thời gian cụ thể
                timeout = timeToWait * 1000 + 3000

            } else {
                // Nếu timestamp đã qua, bạn có thể xử lý ở đây nếu cần
                timeout = 1000
            }
        } else {
            getToken()

            timeout = 30000
        }
    } catch (error) {
        console.log('call api err')
        getToken()

        timeout = 30000

    }

    setTimeout(function () {
        test(bot)
    }, timeout);

}

let data_group_cu = {}
let data_group_cu_loinhuan = {}
let data_index = {}
let so_lenh_win = {}

async function guitinnhantunggroup(gameslist, bot, total, issuenumber) {
    // console.log('total ', total)
    let list_group = await db('copytinhieu_k3g88').select('*').where('type', '1').andWhere("start", 1)
    //  console.log('list_group ',list_group)
    for (let group of list_group) {
        let current_cl = group.chienluoc_hientai;
        let doicongthuc = false
        if (data_group_cu[group.id_group]) {
            for (let game of gameslist) {

                if (data_group_cu[group.id_group] && data_group_cu[group.id_group].issure == game.id) {
                    // "index": chienluocvon_index,
                    // "issure": issuenumber,
                    // data_group_cu[group.id_group].issure == game.id
                    // "ketqua": "NONE",
                    // "dudoan": last
                    // soluong: 12
                    let el = data_group_cu[group.id_group]
                    let ketqua = game.game_result[1] == "Nhỏ" ? "N" : 'L'
                    let ketqua2 = game.game_result[2] == "Lẻ" ? "O" : 'C'
                    if (el.dudoan != ketqua && el.dudoan != ketqua2) {
                        if (data_group_cu_loinhuan[group.id_group]) {
                            data_group_cu_loinhuan[group.id_group] = data_group_cu_loinhuan[group.id_group] - el.amount
                        } else {
                            data_group_cu_loinhuan[group.id_group] = 0 - el.amount
                        }
                        if (data_index[group.id_group]) {
                            data_index[group.id_group] = data_index[group.id_group] + 1
                        } else {
                            data_index[group.id_group] = 1
                        }
                        if (group.chuyenct > 0 && data_index[group.id_group] >= group.chuyenct) {
                            console.log('doi cthuc thoi ', group.chuyenct)
                            doicongthuc = true
                        }
                        bot.sendMessage(group.id_group, `🔴 <b>Thua ${el.issure}</b> `, { parse_mode: 'HTML' })
                    } else {
                        //  đúng kết quả
                        if (so_lenh_win[group.id_group]) {
                            so_lenh_win[group.id_group] = so_lenh_win[group.id_group] + 1
                        } else {
                            so_lenh_win[group.id_group] = 1
                        }

                        if (data_group_cu_loinhuan[group.id_group]) {
                            data_group_cu_loinhuan[group.id_group] = data_group_cu_loinhuan[group.id_group] + el.amount
                        } else {
                            data_group_cu_loinhuan[group.id_group] = el.amount
                        }

                        data_index[group.id_group] = 0

                        bot.sendMessage(group.id_group, `🟢 <b>Win:
Chốt lãi: ${data_group_cu_loinhuan[group.id_group]}</b>`, { parse_mode: 'HTML' })
                        if (group.winngung && data_group_cu_loinhuan[group.id_group] >= group.winngung) {

                            await db("copytinhieu_k3g88").update('start', 0).where('id', group.id)
                            bot.sendMessage(group.id_group, `<b>lãi đủ rồi... chốt lãi thôi ✅
Cảm ơn các bạn đã theo dõi !</b>`, { parse_mode: 'HTML' })
                        }
                        if (group.lenhwinngung && so_lenh_win[group.id_group] >= group.lenhwinngung) {

                            await db("copytinhieu_k3g88").update('start', 0).where('id', group.id)
                            bot.sendMessage(group.id_group, `<b>lãi đủ rồi... chốt lãi thôi ✅
Cảm ơn các bạn đã theo dõi !</b>`, { parse_mode: 'HTML' })
                        }
                    }
                    //    tính đến lợi nhuận đủ chỉ tiêu chưa

                    delete data_group_cu[group.id_group]
                }

            }

        }


        if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(current_cl)) {
            let key = "chienluocdata_" + current_cl
            if (!group[key] || group[key] == "NONE") {
                //  chưa cài
                break
            }
            let chienluoc = JSON.parse(group[key])
            let chienluocvon_index = 0
            let chienluocvon = JSON.parse(group.chienlucvon)
            //  kiểm tra xem gãy chưa
            if (chienluocvon_index >= chienluocvon.length || doicongthuc) {
                //     gãy rồi
                //  1 chuyển lên ct cao hơn
                //  2 reset về rank

                if (current_cl == 10) {
                    data_index[group.id_group] = 0
                    await db("copytinhieu_k3g88").update('chienluoc_hientai', 1).where('id', group.id)
                    delete data_index[group.id_group]
                    delete data_group_cu[group.id_group]
                    break
                }
                let rank_moi = current_cl + 1
                let keymoi = "chienluocdata_" + rank_moi

                if (!group[keymoi] || group[keymoi] == "NONE") {
                    //  chưa cài
                    await db("copytinhieu_k3g88").update('chienluoc_hientai', 1).where('id', group.id)
                    delete data_index[group.id_group]
                    delete data_group_cu[group.id_group]
                    break

                }
                await db("copytinhieu_k3g88").update('chienluoc_hientai', rank_moi).where('id', group.id)
                // delete data_index[group.id_group]
                // delete data_group_cu[group.id_group]
                break

            }
            //     kiểm tra xem có trúng ko
            console.log('chienluoc ', chienluoc)

            for (let element of chienluoc) {
                // 3L_N  2L2N_N
                console.log('kakkak222 ', element)
                let check = element.slice(0, element.length - 2);

                let check2 = total.total.slice(0, check.length);
                let check3 = total.total2.slice(0, check.length);
                let check4 = total.total3.slice(0, check.length);

                if (data_index[group.id_group]) {
                    chienluocvon_index = data_index[group.id_group]
                } else {
                    data_index[group.id_group] = chienluocvon_index
                }

                console.log('kakkak ', element)

                let soluong = Number(chienluocvon[chienluocvon_index])
                if (check === check2) {
                    //  đúng dk
                    // vào lệnh
                    await delay(5000)
                    let last = element.slice(element.length - 1, element.length)

                    let dudoan = ""
                    console.log('du daon ', dudoan, last, element)
                    if (last == "L") {
                        dudoan = 'LỚN'
                    }
                    if (last == "N") {
                        dudoan = 'NHỎ'
                    }
                    if (last == "C") {
                        dudoan = 'CHẴN'
                    }
                    if (last == "O") {
                        dudoan = 'LẺ'
                    }

                    bot.sendMessage(group.id_group, `<b>Trò Chơi K3 Lottery 1 phút:
Kỳ xổ ${issuenumber}

Kết quả dự đoán : ${dudoan}

Chọn ${dudoan} ${soluong}</b>`, { parse_mode: 'HTML' })
                    data_group_cu[group.id_group] = {
                        "index": chienluocvon_index,
                        "amount": soluong,
                        "issure": issuenumber,
                        "ketqua": "NONE",
                        "chatid": group.id_group,
                        "dudoan": last,

                    }
                    break
                }
                if (check === check3) {
                    //  đúng dk
                    // vào lệnh
                    await delay(5000)
                    let last = element.slice(element.length - 1, element.length)
                    let dudoan = ""
                    console.log('du daon ', dudoan, last, element)
                    if (last == "L") {
                        dudoan = 'LỚN'
                    }
                    if (last == "N") {
                        dudoan = 'NHỎ'
                    }
                    if (last == "C") {
                        dudoan = 'CHẴN'
                    }
                    if (last == "O") {
                        dudoan = 'LẺ'
                    }

                    bot.sendMessage(group.id_group, `<b>Trò Chơi K3 Lottery 1 phút:
Kỳ xổ ${issuenumber}

Kết quả dự đoán : ${dudoan}

Chọn ${dudoan} ${soluong}</b>`, { parse_mode: 'HTML' })
                    data_group_cu[group.id_group] = {
                        "index": chienluocvon_index,
                        "amount": soluong,
                        "issure": issuenumber,
                        "ketqua": "NONE",
                        "chatid": group.id_group,
                        "dudoan": last
                    }
                    break
                }
                if (check === check4) {
                    //  đúng dk
                    // vào lệnh
                    await delay(5000)
                    let last = element.slice(element.length - 1, element.length)
                    let dudoan = ""
                    console.log('du daon ', dudoan, last, element)
                    if (last == "L") {
                        dudoan = 'LỚN'
                    }
                    if (last == "N") {
                        dudoan = 'NHỎ'
                    }
                    if (last == "C") {
                        dudoan = 'CHẴN'
                    }
                    if (last == "O") {
                        dudoan = 'LẺ'
                    }

                    bot.sendMessage(group.id_group, `<b>Trò Chơi K3 Lottery 1 phút:
Kỳ xổ ${issuenumber}

Kết quả dự đoán : ${dudoan}

Chọn ${dudoan} ${soluong}</b>`, { parse_mode: 'HTML' })
                    data_group_cu[group.id_group] = {
                        "index": chienluocvon_index,
                        "amount": soluong,
                        "issure": issuenumber,
                        "ketqua": "NONE",
                        "chatid": group.id_group,
                        "dudoan": last
                    }
                    break

                }

            }



        }


    }
    let arr = Object.keys(data_group_cu_loinhuan) // những id group
    let list_group_id = list_group.map(e => e.id_group)  // đang run
    for (let el of arr) {
        if (list_group_id.includes(el)) {

        } else {
            delete data_group_cu_loinhuan[el]
            delete so_lenh_win[el]
            delete data_index[el]
        }
    }

}
function isTimeExceeded(time) {
    // Lấy thời gian hiện tại
    const currentTime = getCurrentTime();
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

    // Tách giờ và phút từ tham số `time`
    const [hours, minutes] = time.split('h').map(Number);

    // So sánh thời gian
    return currentHours > hours || (currentHours === hours && currentMinutes > minutes);
}
async function check_dk(issuenumber, bot) {

    try {
        let url = new URL(
            "https://88lotte.com/api/game/history/k3"
        );

        let params = {
            "page": "1",
            "type": "1",
        };
        let pt = "get"
        Object.keys(params)
            .forEach(key => url.searchParams.append(key, params[key]));
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + token,
        };

        let list_lich_su = await callapi(url, pt, headers, {})


        if (list_lich_su && list_lich_su.listItems && list_lich_su.listItems.length !== 0) {

            let list_group = await db('copytinhieu_k3g88').select('*').where('type', '1').andWhere("start", 2)
            for (let el of list_group) {
                if (!el.timechay || el.timechay == "NONE") {

                    await db('copytinhieu_k3g88').update("start", 1).where('id', el.id)
                } else {
                    let check = isTimeExceeded(el.timechay)
                    if (check) {
                        await db('copytinhieu_k3g88').update("start", 1).where('id', el.id)
                    }
                }

            }
            let list_group2 = await db('copytinhieu_k3g88').select('*').where('type', '1').andWhere("start", 1)
            for (let el of list_group2) {
                if (!el.timengung || el.timengung == "NONE") {

                    // await db('copytinhieu_k3g88').update("start", 1).where('id', el.id)
                } else {
                    let check = isTimeExceeded(el.timengung)
                    if (check && data_group_cu_loinhuan[el.id_group] > 0) {
                        await db('copytinhieu_k3g88').update("start", 0).where('id', el.id)
                        bot.sendMessage(el.id_group, `<b>Cảm ơn anhc hị đã theo dõi !
Chúc anh chị chơi game vui vẻ </b>`, { parse_mode: 'HTML' })
                    }
                }

            }
            let total = await xacdinhlichsu(list_lich_su.listItems, bot)
            guitinnhantunggroup(list_lich_su.listItems, bot, total, issuenumber)
            // let trybonhotam = await db('bonhotam').select('*').where('issuenumber', issuenumber).andWhere('type', 'k3go1').andWhere("status", 1).first()
            // if (trybonhotam) {
            //     return
            // }
            /*

            list = await db(table).select("*")
                .where("status", 1)
                .andWhere('chienluoc_id', '<>', 0)
                .andWhere("k3go1", 1)
                .andWhere("chienluocdata", "<>", "NONE")
                .andWhere("chienluoc", "<>", "NONE")
                .andWhere("activeacc", 1)
            //  .where('status_trade', 1)

            let list2 = await db(table).select("*")
                .where("status", 1)
                .andWhere('coppy', "on")
                .andWhere("doigay", "off")
                .andWhere("k3go1", 1)
                .andWhere("chienluoc", "<>", "NONE")
                .andWhere("chienluocdata", "NONE")
                .andWhere("activeacc", 1)

            let data_copy = await db('copytinhieu_k3go').select('*').where('status', 1).andWhere("type", "1").first()
            if (data_copy) {
                let list_copy = list2.map(e => {
                    e.chienluoc_id = 100
                    e.chienluocdata = data_copy.chienluocdata
                    e.chienluocdata_goc = data_copy.chienluocdata_goc
                    e.copystatus = true
                    return e
                })
                list = list.concat(list_copy)
            }



            await delay(1000)
            for (let item of list) {

                let json = JSON.parse(item.chienluocdata)

                for (let element of json) {
                    // 3L_N  2L2N_N
                    let check = element.slice(0, element.length - 2);

                    let check2 = total.slice(0, check.length);

                    if (check === check2) {
                        //  đúng dk
                        // vào lệnh
                        // await vaolenhtaikhoan(item, element, issuenumber, bot)
                        // break
                    }
                    //   9359237.64 :9359237.64 9349237.64
                }

            }
            */


        }
        /*
            let arr = Object.keys(data_loi_nhuan)
            let list_user = list.map(e => e.usersname)
            for (let el of arr) {
                if (list_user.includes(el)) {
    
                } else {
                    delete data_loi_nhuan[el]
                    delete data_bet[el]
                    delete data_tong_tien_cuoc[el]
                }
            }
            */
    } catch (e) {
        console.log('loi vao lenh ', e)
    }
    /*
    if (bonhotam[issuenumber] && bonhotam[issuenumber].length > 0) {
        await db("bonhotam").insert({
            issuenumber: issuenumber,
            type: 'k3go1',
            data: JSON.stringify(bonhotam[issuenumber]),
            status: 1
        })
    }
      */

}
//  status
//  1 là đang hoạt động
//  2 là user tele đó đã đăng nhập nick khác
//  3 là 1 user tele đã đăng nhập . bị đá ra
// status_trade
// 0 chưa hoạt động
//  1 đã chọn ct
//  2L1N
let tk_hethong
async function vaolenhtaikhoan(bot) {
    // https://82vn82vnapi.com/api/webapi/GetGameIssueList
    //     type: 1
    // language: vi
    let tao_api = false

    try {
        let body = {
            "username": "0991455506",
            "password": "111222"
        };
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        tk_hethong = await callapi('https://88lotte.com/api/login', 'post', headers, body)
        if (tk_hethong) {
            token = tk_hethong.access_token
            tao_api = true
            test(bot)
        }
    } catch (e) {
        console.log("runbot err", e)

    }
    if (!tao_api) {
        setTimeout(function () {
            vaolenhtaikhoan(bot)
        }, 30000);
    }

}
exports.runbot = async function (bot) {
    // https://82vn82vnapi.com/api/webapi/GetGameIssueList
    //     type: 1
    // language: vi
    let tao_api = false

    try {
        let body = {
            "username": "0991455506",
            "password": "111222"
        };
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        tk_hethong = await callapi('https://88lotte.com/api/login', 'post', headers, body)
        if (tk_hethong) {
            token = tk_hethong.access_token
            tao_api = true
            test(bot)
        }
    } catch (e) {
        console.log("runbot err", e)

    }
    if (!tao_api) {
        setTimeout(function () {
            vaolenhtaikhoan(bot)
        }, 30000);
    }

}


// async function vaolenhtaikhoan(item, element, issuenumber, bot) {
//     let dangnhaplai = ""
//     try {
//         let last = element.slice(element.length - 1, element.length)
//         let chienluoc_von = item.chienluoc.split(',')
//         if (!data_bet[item.usersname]) {
//             data_bet[item.usersname] = 0
//         }
//         let body = {
//             amount: 1000,
//             betCount: Math.round(parseInt(chienluoc_von[data_bet[item.usersname]]) / 1000),
//             gameType: "2",
//             issuenumber: issuenumber,
//             language: 2,
//             random: It(),
//             // selectType: "H",
//             // signature: "7BC422BC2894CF55EC1B5056292A5D12",
//             timestamp: getTime_now(),
//             typeId: 9
//         }
//         let data = {
//             uid: item.UserId,
//             sign: item.Sign,
//             gametype: 6,
//             typeId: 9,
//             language: "vi",
//             amount: "1000",
//             betcount: Math.round(parseInt(chienluoc_von[data_bet[item.usersname]]) / 1000),
//             issuenumber: issuenumber

//         }

//         if (last == "N") {
//             if (item.cainguoc == 'on') {
//                 body.selectType = "H"
//             } else {
//                 body.selectType = "L"
//             }

//         } else {
//             if (item.cainguoc == 'on') {
//                 body.selectType = "L"
//             } else {
//                 body.selectType = "H"
//             }

//         }

//         let result

//         let signature = getsignature(body)
//         body.signature = signature

//         if (body.betCount >= 1) {
//             result = await axios.post("https://82vn82vnapi.com/api/webapi/K3GameBetting", body, {
//                 headers: {
//                     'content-type': 'application/json;charset=UTF-8',
//                     'Authorization': `Bearer ${item.Sign}`,
//                     'User-Agent': userAgent
//                 },
//             })

//         } else {
//             result = {
//                 data: {
//                     code: 0,
//                     data: [],
//                     success: true,
//                     msg: 'Bet success'
//                 }
//             }
//         }
//         if (result.data) {

//             if (result.data && result.data.msg == 'Bet success' && result.data.code == 0) {
//                 if (bonhotam[issuenumber]) {
//                     body.id = item.id
//                     body.token = item.Sign
//                     body.refreshToken = item.refreshToken
//                     body.chatId = item.tele_id
//                     body.usersname = item.usersname
//                     body.lodung = item.lodung
//                     body.loidung = item.loidung
//                     body.caidca = item.caidca
//                     body.chienluoc_von = chienluoc_von
//                     bonhotam[issuenumber].push(body)
//                 } else {
//                     body.id = item.id
//                     body.token = item.Sign
//                     body.refreshToken = item.refreshToken
//                     body.chatId = item.tele_id
//                     body.usersname = item.usersname
//                     body.lodung = item.lodung
//                     body.loidung = item.loidung
//                     body.caidca = item.caidca
//                     body.chienluoc_von = chienluoc_von
//                     bonhotam[issuenumber] = [body]
//                 }

//                 if (data_tong_tien_cuoc[item.usersname]) {
//                     data_tong_tien_cuoc[item.usersname] = data_tong_tien_cuoc[item.usersname] + body.betCount;
//                 } else {
//                     data_tong_tien_cuoc[item.usersname] = body.betCount;
//                 }

//                 bot.sendMessage(item.tele_id, `✅ Đã đặt cược K3-GO 1 ${body.selectType == "H" ? "Lớn" : "Nhỏ"} - ${body.betCount}000đ - Kỳ xổ ${issuenumber}`,)
//             } else {
//                 //  đặt cược lỗi
//                 let msg = result.data.msg
//                 if (msg == "Balance is not enough") {
//                     await db(table).update('k3go1', 0).where('id', item.id)


//                 }


//             }
//         }

//     } catch (error) {
//         if (error && error.response && error.response.data && error.response.data.msg == "No operation permission") {
//             // 
//             let check = await getInfor(item.Sign, item.refreshToken, item.usersname)
//             if (!check || !check.status) {
//                 await db(table).update('status', 3).where('usersname', item.usersname)
//                 return bot.sendMessage(item.tele_id, `❌ Dừng copy vì lý do: Tài khoản đã đăng xuất
//             Kỳ này: ${issuenumber}`)
//             }

//         }
//         console.log("loi vao lenh ko duoc ")
//     }





// }
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getsodu_hien_tai(sign) {
    try {
        let body = {
            language: 2,
            random: It(),

            timestamp: getTime_now(),
        }
        let signature = getsignature(body)
        body.signature = signature
        let result = await axios.post("https://82vn82vnapi.com/api/webapi/GetBalance", body, {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${sign}`,
                'User-Agent': userAgent
            },
            timeout: 3000
        })

        if (result.data && result.data.data && result.data.code == 0 && result.data) {
            return {
                status: true,
                value: result.data.data.amount
            }
        } else {
            return {
                status: false,
                value: 0
            }
        }

    } catch (e) {
        console.log('eeeeee ', e)
        return {
            status: false,
            value: 0
        }
    }
}
// "Số tiền không đủ" "sign error"
async function ketqua_run_bot(ketqua, item, bot, Number_one) {
    for (let element of bonhotam[item.issueNumber]) {
        await delay(200)
        if (element.selectType == ketqua) {
            if (data_loi_nhuan[element.usersname]) {
                data_loi_nhuan[element.usersname] = data_loi_nhuan[element.usersname] + Math.round(parseInt(element.betCount) * 0.96 * 1000)
            } else {
                data_loi_nhuan[element.usersname] = Math.round(parseInt(element.betCount) * 0.96 * 1000)
            }
            //  chọn đúng
            if (element.caidca == 'thang') {
                if (data_bet[element.usersname] >= (element.chienluoc_von.length - 1)) {
                    data_bet[element.usersname] = 0
                } else {
                    data_bet[element.usersname] = data_bet[element.usersname] + 1
                }

            } else {
                data_bet[element.usersname] = 0
            }
            // let soduhientai = await getsodu_hien_tai(element.token)


            bot.sendMessage(element.chatId, `🟢 Chúc mừng bạn đã thắng ${Math.round(parseInt(element.betCount) * 0.96 * 1000)}đ K3-GO 1 kì ${element.issuenumber}
Tổng lợi nhuận: ${data_loi_nhuan[element.usersname]}đ
Tổng tiền cược:  ${data_tong_tien_cuoc[element.usersname] ? data_tong_tien_cuoc[element.usersname] + '000' : ''}đ`)
            // await db('lichsu_ma').insert({
            //     "uid": element.uid,
            //     "usersid": element.id,
            //     "gametype": element.gametype,
            //     "typeid": element.typeid,
            //     "amount": element.amount,
            //     "betcount": element.betcount,
            //     "issuenumber": element.issuenumber,
            //     "ketqua": Number_one,
            //     "selecttype": element.selecttype,
            //     "session": 1,
            //     "thang": 1
            // })
            if (element.loidung) {

                if (data_loi_nhuan[element.usersname] > element.loidung) {
                    bot.sendMessage(element.chatId, `🟢 Chúc mừng bạn đã đạt tới mức lợi nhuận kỳ vọng để dừng bot`)
                    await db(table).update('k3go1', 0).where('id', element.id)
                    delete data_loi_nhuan[element.usersname]
                    delete data_bet[element.usersname]

                }
            }

        } else {
            // kết quả sai
            // 🔴 Rất tiếc bạn đã thua 10000
            if (data_loi_nhuan[element.usersname]) {
                data_loi_nhuan[element.usersname] = data_loi_nhuan[element.usersname] - parseInt(element.betCount) * 1000
            } else {
                data_loi_nhuan[element.usersname] = -parseInt(element.betCount) * 1000
            }
            if (element.caidca == 'thua') {
                if (data_bet[element.usersname] >= (element.chienluoc_von.length - 1)) {
                    data_bet[element.usersname] = 0
                } else {
                    data_bet[element.usersname] = data_bet[element.usersname] + 1
                }

            } else {
                data_bet[element.usersname] = 0
            }
            bot.sendMessage(element.chatId, `🔴 Rất tiếc bạn đã thua ${element.betCount}000đ K3-GO 1 kì ${element.issuenumber}`)
            // await db('lichsu_ma').insert({
            //     "uid": element.uid,
            //     "usersid": element.id,
            //     "gametype": element.gametype,
            //     "typeid": element.typeid,
            //     "amount": element.amount,
            //     "betcount": element.betcount,
            //     "issuenumber": element.issuenumber,
            //     "ketqua": Number_one,
            //     "selecttype": element.selecttype,
            //     "session": 1,
            //     "thang": 0
            // })
            if (element.lodung) {
                //  -10000 100000
                if (data_loi_nhuan[element.usersname] < 0 && Math.abs(data_loi_nhuan[element.usersname]) > element.lodung) {
                    bot.sendMessage(element.chatId, `🔴 Rất tiếc bạn đã thua đến điểm dừng lỗ để dừng bot`)
                    await db(table).update('k3go1', 0).where('id', element.id)
                    delete data_loi_nhuan[element.usersname]
                    delete data_bet[element.usersname]
                }
            }

        }
    }
    delete bonhotam[item.issueNumber]
    await db("bonhotam").update('status', 0).where('issuenumber', item.issueNumber).andWhere('type', 'k3go1').andWhere("status", 1)
}
async function xacdinhlichsu(gameslist, bot) {
    let total = "";
    let total2 = "";
    let total3 = "";
    let first = true
    for (let item of gameslist) {
        let Number_one = parseInt(item.game_result[0])
        // if (!bonhotam[item.id]) {
        //     let trybonhotam = await db('bonhotam').select('*').where('issuenumber', item.id).andWhere('type', 'k3go1').andWhere("status", 1).first()
        //     if (trybonhotam) {
        //         bonhotam[trybonhotam.issuenumber] = JSON.parse(trybonhotam.data)
        //     }
        // }
        let ketqua = item.game_result[1] == "Nhỏ" ? "N" : 'L'
        let ketqua2 = item.game_result[2] == "Lẻ" ? "O" : 'C'
        // if (bonhotam[item.id] && bonhotam[item.id].length > 0) {

        //     await ketqua_run_bot(ketqua, item, bot, Number_one)
        // }
        total = total + ketqua;
        total2 = total2 + ketqua2;
        if (first) {
            first = false
            total3 = "" + item.game_result[0].toString()
        } else {
            total3 = total3 + "-" + item.game_result[0]
        }


    }

    return {
        total: total,
        total2: total2,
        total3: total3
    }
}