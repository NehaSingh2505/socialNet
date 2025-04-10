const socket=io();


$('#chat-box').hide();

$('#send-btn').on('click',()=>{
  const msgtxt=  $('#inp').val();
  if(msgtxt==''){
      return;
  }
  else{
  socket.emit('send-msg',{
    msg:msgtxt,
  })
}
  // baad  me input khali kr do 
  $('#inp').val('');
})

socket.on('recieve-msg',(data)=>{
// console.log(data.msg);
$('#chat').append(`<li class="border mt-2 p-2 rounded-pill"><span class="fw-bold">${data.username}</span>->>${data.msg}</li>`)
});


$('#login-btn').on('click',()=>{
   const login_input= $('#username').val();
    if(login_input==''){
         return;
    }
    else{
   socket.emit('login',{
         username:login_input
   })
}

$('#login').hide();
$('#chat-box').show();
   $('#username').val('');
})