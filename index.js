const express = require('express');
const mongoose = require('mongoose');

const path = require("path");

const app = express();




app.set('view engine', 'ejs');
console.log(__dirname);
app.use('/imgs', express.static(__dirname+'/views/public') );
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const db = mongoose.connection;
const Item = require('./models/Item');
const Login = require('./models/Login');
var isLoggedIn = false;

func=(i)=>{
	console.log(i);
	var arr=[];
	var l=i.items;
	var q;
	for(q=0;q<l.length;q++){
		arr.push({name:l[q].get('name')});
	}
	return {items:arr};
}


app.get('/', (req, res) => {
  res.render('login');
});

generate_default_user=async ()=>{
	const newLogin = new Login({
		uname: 'guest',
		pass: 'guest',
		'random_key': 'random_value'
	  });
	console.log(newLogin);
	await newLogin.save();
}
app.post('/',async  (req,res) => {
	await generate_default_user();

	//if(req.body.uname=='guest' && req.body.pass=='guest'){
	
	Login.find({uname: req.body.uname}, function (err, logins) {
		if (err) {
			console.error(err);
		}
		else{
			if(logins.length ==0)
				res.render('login');
			console.log(logins);
			console.log("user: ",logins[0].get('uname'));
			if(req.body.pass==logins[0].get('pass')){
				console.log("PASSWORD MATCH");
				isLoggedIn = true;
				res.redirect('/main');
			}
			else{
				res.render('login');
			}
		}


	});

	
});


app.get('/main/', (req, res) => {
	if(isLoggedIn==false)
		res.redirect('/login');
	Item.find()
    	.then(items => res.render('index', func({items}) ))
    	.catch(err => res.status(404).json({ msg: 'No items found' }));
});

app.get('/addimage', (req, res) => {
  res.render('addimage');
});

app.post('/main/',async (req,res) => {
	var s  = req.body.search;
	if(s.length ==0||s.indexOf(':')==-1)
		res.redirect('/main');
	if(s[s.length-1]==';'){
		s=s.substring(0,s.length-1);
	}
	//remove spaces
	s=s.replace(/ /g,"");
	//dynamic search query: 
	console.log({name:s});
	var q = {}; // declare the query object
	q['$and']=[];
	var lst=s.split(";");
	
	for(i =0; i< lst.length; i++){
		var li=lst[i].split(":");
		var a=li[0];
		var b=li[1].split(",");
		console.log(b);
		q["$and"].push({ [a]: {$in: b }}); // add to the query object
	}
	console.log(q);
	var srr=[];
	
	await Item.find(q,
		function(err, docs) {
			if (err){
				console.log(err);
				res.status(500).send(err);
			}else{
				console.log("ok: ", docs);
				
				for(p =0; p<docs.length; p++){
					srr.push({name:docs[p].get('name')});
				}
				console.log("length ", srr.length);
			}
	});

	res.render('index', srr.length!=0?({items:srr}):{items:[{name:'imgs/none.jpg'}]});
	
	/*Item.find()
    		.then(items => res.render('index', searchfunc({items}, req.body.search) ))
			.catch(err => res.status(404).json({ msg: 'No items found' }));	*/
	//searchfunc2(req.body.search);

	
});

app.post('/go/add', (req, res) => {
	res.redirect('/addimage');
  });


app.post('/item/add',
	(req, res) => {
	
	
	
	var a2 = req.body.att2;
	if(a2.length == 0 )
		a2 = 'random_key2';
	var v2 = req.body.val2;
	if(v2.length ==0)
		v2 = 'random_value2'
	
	var a3 = req.body.att3;
	if(a3.length == 0 )
		a3 = 'random_key3';
	var v3 = req.body.val3;
	if(v3.length ==0)
		v3 = 'random_value3'
	
	var a4 = req.body.att4;
	if(a4.length == 0 )
		a4 = 'random_key4';
	var v4 = req.body.val4;
	if(v4.length ==0)
		v4 = 'random_value4'

	
	
  const newItem = new Item({
    [req.body.att1]: req.body.val1,
    [a2]: v2,
    [a3]: v3,
    [a4]: v4
	
  });
  
  console.log(newItem);

  newItem.save().then(item => res.redirect('/main'));
});


const port = 3000;

app.listen(port, () => console.log('Server running...'));
