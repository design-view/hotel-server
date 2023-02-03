//common js 구문
//모듈 import ---> require("모듈")
//express 
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const saltRounds = 10;

//서버 생성
const app = express();
// 프로세서의 주소 포트번호
const port = 8080;
const multer = require("multer");
// 브라우져의 cors이슈를 막기 위해 설정
app.use(cors());
app.use("/upload", express.static("upload"));
// json형식 데이터를 처리하도록 설정
app.use(express.json());
// upload폴더 클라이언트에서 접근 가능하도록 설정

//diskStorage() ---> 파일을 저장할때의 모든 제어 기능을 제공
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/event/');
    },
    filename: (req,file,cb)=>{
        const newFilename = file.originalname;
        cb(null, newFilename);
    }
})
const upload = multer({ storage: storage });
//post요청이 왔을때 응답처리
app.post('/upload', upload.single('file'), (req, res) => {
    res.send({
        imageUrl: req.file.filename
    })
});
// mysql연결 생성
const conn = mysql.createConnection({
    host: "hera-database.c75lp1ufvzs3.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "skymin0235",
    port: "3306",
    database: "hotel"
})
// 선연결
conn.connect();
// conn.query("쿼리문", 콜백함수)
app.get("/special", (req, res)=>{
    conn.query("select * from event where e_category = 'special'",
    (error, result, fields)=>{
        res.send(result)
    })
})
//http://localhost:8080/special/1
// req { params: { no: 1 }}
app.get("/special/:no", (req, res)=>{
    const {no} = req.params;
    conn.query(`select * from event where e_category = 'special' and e_no=${no}`,
    (error, result, fields)=>{
        res.send(result)
    })
})

//회원가입 요청
app.post("/join", async (req, res) => {
    //입력받은 비밀번호 mytextpass로 할당
    const mytextpass = req.body.m_pass;
    let myPass = "";
    const {m_name, m_pass, m_phone, m_nickname, m_add1, m_add2, m_email} = req.body;
    console.log(req.body);
    //빈문자열이 아니고 undefined가 아닐때 
    if(mytextpass != '' && mytextpass != undefined){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            //hash메소드 호출되면 인자로 넣어준 비밀번호를 암호화하여
            // 콜백함수 안 hash로 돌려준다.
            bcrypt.hash(mytextpass, salt, function(err, hash) {
                myPass = hash;
                //쿼리작성
                conn.query(`insert into member(m_name, m_pass, m_phone, m_nickname, m_address1, m_address2, m_email) values('${m_name}','${myPass}','${m_phone}','${m_nickname}','${m_add1}','${m_add2}','${m_email}')
    `,(err, result, fields)=>{
        if(result){
            res.send("등록되었습니다.");
        }
        console.log(err);
    })
            });
        });
    }
    // insert into member(m_name, m_pass, m_phone, m_nickname, m_add1, m_add2)
    // values(${})
    
})

//로그인 요청
app.post('/login', async (req, res)=>{
    const { usermail, userpass } = req.body;
    conn.query(`select * from member where m_email = '${usermail}'`, (err, resu, fields)=>{
        if(resu == undefined || resu[0] == undefined ){
            console.log("없습니다.");
            console.log(err);
            res.send("no");
        }else {
            bcrypt.compare(userpass, resu[0].m_pass, function(err,result){
                if(result){
                    res.send(resu[0]);
                }else {
                    res.send("no");
                }
            })
        }
    })
})
app.listen(port, ()=>{
    console.log("서버가 동작하고 있습니다.")
})
