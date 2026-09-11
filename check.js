fetch('https://nao3.vercel.app/store/aaa/sale').then(r=>r.text()).then(t=>{
  console.log(t.substring(0, 1000));
  console.log('---');
  console.log(t.match(/<link[^>]*rel=["']manifest["'][^>]*>/i)?.[0]);
});
