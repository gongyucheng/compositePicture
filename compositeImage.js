import { createCanvas, Image, loadImage } from 'canvas'
import * as fs from 'fs'
import * as path from 'path'
// tslint:disable-next-line:no-var-requires
const request = require('request').defaults({
    encoding: null
})
const scale = 2
// canvas 大小
const canvas_w = 540 * scale
const canvas_h = 432 * scale
// 商品图片评级
const product_pic_x = 106 * scale
const product_pic_y = 0 * scale
const product_pic_w = 325 * scale
const product_pic_h = 325 * scale
// 实验室信息图片frame
const lab_pic_x = 161 * scale
const lab_pic_y = 386 * scale
const lab_pic_w = 217 * scale
const lab_pic_h = 25 * scale

// 评级图片的frame信息(商品图下面的图片)
const rating_pic_x = 195 * scale
const rating_pic_y = 325 * scale
const rating_pic_w = 150 * scale
const rating_pic_h = 41 * scale

// 评级label标签的frame信息(右上角的图片)
const rating_label_x = 370 * scale
const rating_label_y = 10 * scale
const rating_label_w = 150 * scale
const rating_label_h = 85 * scale

// 左边线
const left_line_start_point_x = 0 * scale
const left_line_start_point_y = 345 * scale
const left_line_end_point_x = rating_pic_x - 10 * scale
const left_line_end_point_y = 345 * scale

// 右边线
const right_line_start_point_x = rating_pic_x + rating_pic_w + 10 * scale
const right_line_start_point_y = 345 * scale
const right_line_end_point_x = canvas_w
const right_line_end_point_y = 345 * scale

// enum Rating {
//     'A+' = ['pic_a+.png', 'label_A+.png']
// }

const ratingMap = new Map([
    ['A+', ['pic_a+.png', 'label_A+.png']],
    ['A', ['pic_a.png', 'label_A.png']],
    ['B', ['pic_b.png', '']],
    ['C', ['pic_c.png', '']],
    ['D', ['pic_d.png', '']],
    ['D-', ['pic_d-.png', '']],
])
// 合成商品图片
export async function compositePicture(productImageUrl, rating) {
    const picList = ratingMap.get(rating)
    // 如果解析的图片名列表为空,就生成图片返回
    if (!picList) {
        return
    }
    // 加载canvas
    const canvas = createCanvas(canvas_w, canvas_h)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas_w, canvas_h)

    fetchImage(productImageUrl, async (buffer) => {
        let image = new Image()
        image.src = buffer
        // draw商品图片
        ctx.drawImage(image, product_pic_x, product_pic_y, product_pic_w, product_pic_h)
        // 加载和draw实验室信息图片
        image = await loadImage(path.resolve('./images/pic_lab.png'))
        ctx.drawImage(image, lab_pic_x, lab_pic_y, lab_pic_w, lab_pic_h)

        image = await loadImage(path.resolve(`./images/${picList[0]}`))
        // draw推荐等级图片
        ctx.drawImage(image, rating_pic_x, rating_pic_y, rating_pic_w, rating_pic_h)
        ctx.moveTo(left_line_start_point_x, left_line_start_point_y)
        ctx.lineTo(left_line_end_point_x, left_line_end_point_y)
        ctx.moveTo(right_line_start_point_x, right_line_start_point_y)
        ctx.lineTo(right_line_end_point_x, right_line_end_point_y)
        ctx.lineWidth = 0.5
        ctx.strokeStyle = '#DCDBDB'
        ctx.stroke()
        // 如果解析的图片名列表少于2个,说明第二个没有解析成功,就生成图片返回
        if (picList[1] === '') {
            createImage(picList[0])
            return
        }
        image = await loadImage(path.resolve(`./images/${picList[1]}`))
        // draw实验室和评级label图片
        ctx.drawImage(image, rating_label_x, rating_label_y, rating_label_w, rating_label_h)
        createImage(picList[0])
    })

    // canvas创建图片，并保存在本地文件夹
    function createImage(picName) {
        const out = fs.createWriteStream(path.resolve(`./tmp/${picName}`))
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => console.log('The PNG file was created.'))
        return
    }
    // 从网络获取商品图片
    function fetchImage(url, callback) {
        request.get(url, (error, response, body) => {
            callback(Buffer.from(body))
        })
    }
}

// 测试用
const list = ['A+', 'A', 'B', 'C', 'D', 'D-']
for (const item of list) {
    compositePicture('https://img.okoer.com/upload/images/1533812057.png', item)
}