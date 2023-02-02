const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const multer = require("multer");
//서버 생성
const app = express();
//프로세서의 주소 포트번호 지정
const port = 8080;
//브라우저의 CORS이슈를 막기 위해 사용
app.use(cors());
//json형식의 데이터를 처리하도록 설정
app.use(express.json());
//서버의 upload를 클라이언트 접근가능하도록 설정 
app.use("/upload", express.static("upload"));
//storege생성
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/');
    },
    filename: (req,file,cb)=>{
        const newFilename = file.originalname;
        cb(null, newFilename);
    }
})
//upload객체 생성하기
const upload = multer({ storage: storage });
//upload경로로 post요청 시 응답 구현하기
app.post('/upload', upload.single('file'), (req, res) => {
    res.send({
        imageUrl: req.file.filename
    })
});
//mysql연결생성
const conn = mysql.createConnection({
    host: "hera-database.c75lp1ufvzs3.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "skymin0235",
    port: "3306",
    database: "hotel"
})
//선연결
conn.connect();
//conn.query("쿼리문", 콜백함수)
//get요청
app.get("/special", (req, res)=>{
    conn.query("select * from event where e_category = 'special'", function(error, result, fields){
        res.send(result);
    })   
})
app.get("/special/:no", (req, res)=>{
    const {no} = req.params;
    conn.query(`select * from event where e_category = 'special' and e_no = ${no}`, function(error, result, fields){
        res.send(result);
    })
})
//서버를 구동
app.listen(port, ()=>{
    console.log("서버가 동작하고 있습니다.");
})