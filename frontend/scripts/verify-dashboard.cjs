const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
(async () => {
  const server = await (await import('vite')).createServer({server: {host: '127.0.0.1', port: 0}}); await server.listen();
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const out = path.resolve('../.runtime-test/dashboard'); await fs.mkdir(out, {recursive: true});
  let role = 'ADMIN', empty = false, blankName = false;
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const image = '/src/assets/images/hoi-an.png';
  const reviews = [{reviewId:'r1', userId:'u1',tenUser:'Minh Anh',soSao:5,tieuDe:'Một chuyến đi đáng nhớ',noiDung:'Không gian đẹp và nhiều trải nghiệm thú vị.',ngayTao:'2026-10-20',hinhAnh:[],binhLuan:[{commentId:'c1',userId:'u1',tenUser:'Minh Anh',noiDung:'Mình sẽ quay lại!',ngayTao:'2026-10-20',traLoi:[]}]},{reviewId:'r2',userId:'u1',tenUser:'Minh Anh',soSao:4,tieuDe:'Rất đáng ghé thăm',noiDung:'Một nơi để thư giãn vào cuối tuần.',ngayTao:'2026-10-18',hinhAnh:[],binhLuan:[]}];
  const user = () => ({id:'u1', hoTen:blankName?'':'Minh Anh',username:blankName?'':'minhanh',email:'qa@example.test',role,trangThai:'ACTIVE',ngayTao:'2026-01-01'});
  const place = () => ({id:'p1',ten:'Phố cổ Hội An',slug:'hoi-an',loai:'DU_LICH',trangThai:'ACTIVE',ratingAvg:empty?0:4.5,reviewCount:empty?0:2,hinhAnh:[image],danhMuc:[{danhMucId:'cat1',ten:'Du lịch'}],diaChi:{thanhPho:'Hội An'},reviews:empty?[]:reviews});
  await page.route('**/api/**', route => {
    const p = new URL(route.request().url()).pathname;
    const ok = data => route.fulfill({json:{success:true,data}});
    if (p==='/api/auth/me') return ok(user());
    if (p==='/api/admin/nguoi-dung') return ok([user()]);
    if (p==='/api/admin/dia-diem') return ok([place()]);
    if (p==='/api/danh-muc'||p==='/api/admin/danh-muc') return ok([{id:'cat1',ten:'Du lịch',slug:'du-lich',trangThai:'ACTIVE'}]);
    if (p==='/api/dia-diem') return ok({content:[place()],totalPages:1,page:1,size:50,totalElements:1});
    if (p==='/api/dia-diem/hoi-an') return ok(place());
    throw Error('Unexpected API '+p);
  });
  let checks=0;
  try {
    for (const width of [390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      for (const [name,url,r,e] of [['admin-profile','/profile','ADMIN',false],['admin-reviews','/my-reviews','ADMIN',false],['dashboard','/admin','ADMIN',false],['user-profile','/profile','USER',false],['user-reviews','/my-reviews','USER',false],['user-empty','/my-reviews','USER',true]]) {
        role=r; empty=e; await page.goto(base+url); await page.locator('header').waitFor(); await page.locator('main h1').waitFor(); await page.evaluate(()=>document.fonts.ready);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false, name+'@'+width);
        if(url==='/profile') {assert.equal(await page.getByRole('heading',{name:'Hồ sơ',exact:true}).count(),1); await page.getByRole('heading',{name:'Minh Anh',exact:true}).waitFor();}
        if(url==='/admin') await page.getByRole('img',{name:'Số đánh giá theo ngày'}).waitFor();
        if(e) await page.getByRole('heading',{name:'Bạn chưa có đánh giá nào'}).waitFor();
        if(r==='ADMIN') assert.equal(await page.getByRole('navigation',{name:'Quản trị',exact:true}).count(),1);
        await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true}); checks++;
      }
    }
    empty=false;role='USER';await page.goto(base+'/my-reviews'); await page.getByRole('heading',{name:'Danh sách đánh giá (2)'}).waitFor();
    await page.getByLabel('Số sao',{exact:true}).selectOption('5'); await page.getByRole('button',{name:'Lọc',exact:true}).click(); await page.getByRole('heading',{name:'Danh sách đánh giá (1)'}).waitFor();
    await page.getByRole('button',{name:'Đặt lại',exact:true}).click(); await page.getByRole('heading',{name:'Danh sách đánh giá (2)'}).waitFor();
    await page.goto(base+'/profile'); await page.getByRole('tab',{name:'Hoạt động',exact:true}).click(); await page.getByRole('link',{name:'Một chuyến đi đáng nhớ',exact:true}).waitFor();
    blankName=true; await page.reload(); await page.getByRole('heading',{name:'Hồ sơ',exact:true}).first().waitFor(); assert.equal(await page.getByRole('heading',{name:'Hồ sơ thành viên',exact:true}).count(),0);
    assert.deepEqual(errors,[]); console.log(JSON.stringify({status:'passed',responsiveChecks:checks,flows:['admin sidebar','account name and fallback','review filter/reset','empty state and suggestions','profile activity','data-driven charts'],pageErrors:errors}));
  } finally {await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
