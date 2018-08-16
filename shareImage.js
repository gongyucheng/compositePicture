

const { createCanvas, loadImage,Image} = require('canvas')
const request = require('request').defaults({ encoding: null });
const fs = require('fs')

const scale = 2
// canvas 大小
canvas_w = 540 * scale
canvas_h = 432 * scale
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
const rating_pic_w= 150 * scale
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

// 合成商品图片
function compositePicture(productImageUrl,rating){
    // 加载canvas
    const canvas = createCanvas(canvas_w, canvas_h)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas_w,canvas_h)

    fetchImage(productImageUrl, (buffer) => {
        const image = new Image;
        image.src = buffer;
        //draw商品图片
        ctx.drawImage(image, product_pic_x, product_pic_y, product_pic_w,product_pic_h);

        // 加载和draw实验室信息图片
        loadImage('./images/pic_lab.png').then((image)=>{
            ctx.drawImage(image,lab_pic_x,lab_pic_y,lab_pic_w,lab_pic_h)

        })
        .then(()=>{
            
            let picList = parseRating(rating)
            // 如果解析的图片名列表为空,就生成图片返回
            if(picList.length == 0){
                
                createImage(picList[0])
                return
               
            }    
           
            loadImage(`./images/${picList[0]}`).then((image)=>{
                //draw推荐等级图片
                ctx.drawImage(image,rating_pic_x,rating_pic_y,rating_pic_w,rating_pic_h)
                
                ctx.moveTo(left_line_start_point_x,left_line_start_point_y);
                ctx.lineTo(left_line_end_point_x,left_line_end_point_y);
                ctx.moveTo(right_line_start_point_x,right_line_start_point_y);
                ctx.lineTo(right_line_end_point_x,right_line_end_point_y);

                ctx.lineWidth = 0.5
                ctx.strokeStyle = '#DCDBDB'
                ctx.stroke()
                

            }).then(()=>{
                
                let picList = parseRating(rating)
              
                // 如果解析的图片名列表少于2个,说明第二个没有解析成功,就生成图片返回
                if(picList.length > 1 && picList[1] === ''){
                   
                    createImage(picList[0])
             
                    return
                }    
                loadImage(`./images/${picList[1]}`).then((image)=>{
                    //draw实验室和评级label图片
                    ctx.drawImage(image,rating_label_x,rating_label_y,rating_label_w,rating_label_h)
                    
                    createImage(picList[0])
                    
                })
            })
            
        })

        
        

    })
    
    // canvas创建图片，并保存在本地文件夹
    function createImage(picName){
        const out = fs.createWriteStream(__dirname + `/compositePicture/${picName}`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The PNG file was created.'))
        return
    }
    // 从网络获取商品图片
    function fetchImage (url, callback) {
        request.get(url, (error, response, body) => {
        callback(new Buffer.from(body));
        });
    }
    // 根据商品图片解析，生成评级图
    function parseRating(rating){
        switch (rating) {
            case "A+":
              return ["pic_a+.png","label_A+.png"]
              
            case "A":
              return ["pic_a.png","label_A.png"]
              
            case "B":
              return ["pic_b.png",'']
              
            case "C":
              return ["pic_c.png",'']
              
            case "D":
              return ["pic_d.png",'']
              
            case "D-":
              return ["pic_d-.png",'']
            default:
              return []
              
          }

    }
}


//测试用
 list = ['A+','A','B','C','D','D-']
for(var i = 0;i<list.length;i++){
    compositePicture('https://img.okoer.com/upload/images/1533812057.png',list[i])
}
