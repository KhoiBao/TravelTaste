// UI contract/visual test: intercepts HTTP with fixtures; never writes the user's database.
const {launchBrowser} = require('./browser.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const server = await (await import('vite')).createServer({server: {host: '127.0.0.1', port: 0}});
  await server.listen();
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const out = path.resolve('../.runtime-test/saved-places'); await fs.mkdir(out, {recursive: true});
  const errors = [], writes = [];
  page.on('pageerror', e => errors.push(e.message));
  let logged = true;
  const user = {id: 'u1', hoTen: 'Minh Anh', username: 'minhanh', role: 'USER', email: 'qa@example.test', trangThai: 'ACTIVE'};
  const places = [
    {id: 'p1', ten: 'Bún chả Hương Liên', slug: 'bun-cha-huong-lien', loai: 'AN_UONG', ratingAvg: 4.8, reviewCount: 12, trangThai: 'ACTIVE', daYeuThich: true, luotThich: 3, danhMuc: [], hinhAnh: [], diaChi: {thanhPho: 'Hà Nội'}},
    {id: 'p2', ten: 'Phở Thìn Lò Đúc', slug: 'pho-thin-lo-duc', loai: 'AN_UONG', ratingAvg: 4.5, reviewCount: 7, trangThai: 'ACTIVE', daYeuThich: false, luotThich: 1, danhMuc: [], hinhAnh: [], diaChi: {thanhPho: 'Hà Nội'}},
  ];
  await page.route('**/api/**', async route => {
    const q = route.request(), url = new URL(q.url()), method = q.method();
    const ok = data => route.fulfill({json: {success: true, data}});
    // Máy chủ chỉ báo đã lưu cho người dùng đang đăng nhập, khách chưa đăng nhập luôn thấy false.
    const publicPlace = place => ({...place, daYeuThich: logged ? place.daYeuThich : false});
    if (method !== 'GET') writes.push({method, path: url.pathname});
    if (url.pathname === '/api/auth/csrf') return ok({token: 'test', headerName: 'X-CSRF-TOKEN'});
    if (url.pathname === '/api/auth/me') return logged ? ok(user) : route.fulfill({status: 401, json: {success: false, message: 'Chưa đăng nhập'}});
    if (url.pathname === '/api/danh-muc') return ok([{id: 'c1', ten: 'Ăn uống', trangThai: 'ACTIVE'}]);
    if (url.pathname === '/api/search') return ok({content: places.map(publicPlace), page: 1, size: 50, totalPages: 1, totalElements: places.length});
    if (url.pathname === '/api/dia-diem') return ok({content: places.map(publicPlace), page: 1, size: 50, totalPages: 1, totalElements: places.length});
    if (url.pathname.startsWith('/api/dia-diem/')) {
      const place = places.find(p => p.slug === url.pathname.split('/').pop());
      if (!place) return route.fulfill({status: 404, json: {success: false, message: 'Không tìm thấy địa điểm'}});
      return ok({...publicPlace(place), reviews: []});
    }
    if (url.pathname.startsWith('/api/yeu-thich/')) {
      const place = places.find(p => p.id === url.pathname.split('/').pop());
      if (!place) return route.fulfill({status: 404, json: {success: false, message: 'Không tìm thấy địa điểm'}});
      place.daYeuThich = method === 'POST';
      place.luotThich += place.daYeuThich ? 1 : -1;
      return ok({diaDiemId: place.id, daYeuThich: place.daYeuThich, luotThich: place.luotThich});
    }
    throw Error('Unexpected request: ' + method + ' ' + url.pathname);
  });
  try {
    await page.goto(base + '/');
    await page.getByRole('heading', {name: 'Điểm đến được yêu thích'}).waitFor();
    // Card heart reflects the server state and persists through the API.
    await page.getByRole('button', {name: 'Bỏ yêu thích Bún chả Hương Liên', exact: true}).waitFor();
    await page.getByRole('button', {name: 'Yêu thích Phở Thìn Lò Đúc', exact: true}).waitFor();
    await page.getByRole('button', {name: 'Yêu thích Phở Thìn Lò Đúc', exact: true}).click();
    await page.getByRole('button', {name: 'Bỏ yêu thích Phở Thìn Lò Đúc', exact: true}).waitFor();
    assert(writes.some(w => w.method === 'POST' && w.path === '/api/yeu-thich/p2'), 'Liking a card must call the API');
    // The account menu links to the saved places page.
    await page.getByRole('button', {name: 'Mở menu tài khoản', exact: true}).click();
    await page.getByRole('link', {name: 'Địa điểm đã lưu', exact: true}).click();
    await page.waitForURL('**/saved-places');
    await page.getByRole('heading', {name: 'Địa điểm đã lưu', exact: true}).waitFor();
    await page.getByRole('link', {name: 'Bún chả Hương Liên', exact: true}).waitFor();
    await page.getByRole('link', {name: 'Phở Thìn Lò Đúc', exact: true}).waitFor();
    // The detail page heart toggles the same saved state.
    await page.goto(base + '/places/p2');
    await page.getByRole('heading', {name: 'Phở Thìn Lò Đúc', exact: true}).waitFor();
    await page.getByRole('button', {name: 'Bỏ yêu thích Phở Thìn Lò Đúc', exact: true}).click();
    await page.getByRole('button', {name: 'Yêu thích Phở Thìn Lò Đúc', exact: true}).waitFor();
    assert(writes.some(w => w.method === 'DELETE' && w.path === '/api/yeu-thich/p2'), 'Unliking must call the API');
    // The saved page reflects the removal.
    await page.goto(base + '/saved-places');
    await page.getByRole('link', {name: 'Bún chả Hương Liên', exact: true}).waitFor();
    assert.equal(await page.getByRole('link', {name: 'Phở Thìn Lò Đúc', exact: true}).count(), 0);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({width, height: 960});
      await page.goto(base + '/saved-places');
      await page.getByRole('heading', {name: 'Địa điểm đã lưu', exact: true}).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({path: path.join(out, 'saved-places-' + width + '.png'), fullPage: true});
    }
    // A guest is asked to sign in instead of liking.
    logged = false;
    await page.goto(base + '/places/p1');
    await page.getByRole('button', {name: 'Yêu thích Bún chả Hương Liên', exact: true}).click();
    await page.waitForURL('**/login');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({status: 'passed', flows: ['card heart persists through the API', 'account menu link to saved places', 'detail page heart toggles saved state', 'saved page reflects removal', 'guest is redirected to sign in'], viewports: 3, pageErrors: errors}));
  } finally {await browser.close(); await server.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
