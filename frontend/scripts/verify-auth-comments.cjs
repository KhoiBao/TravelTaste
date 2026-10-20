// UI contract/visual test: intercepts HTTP with fixtures; never writes the user's database.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const server = await (await import('vite')).createServer({server: {host: '127.0.0.1', port: 0}});
  await server.listen();
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const out = path.resolve('../.runtime-test/auth-comments'); await fs.mkdir(out, {recursive: true});
  const errors = [], writes = [];
  page.on('pageerror', e => errors.push(e.message));
  let logged = false;
  const user = {id: 'u1', hoTen: 'Minh Anh', username: 'minhanh', role: 'USER', email: 'qa@example.test', trangThai: 'ACTIVE'};
  const node = (commentId, userId, tenUser, noiDung, traLoi = []) => ({commentId, userId, tenUser, noiDung, traLoi, ngayTao: '2026-10-20'});
  const review = {reviewId: 'r1', userId: 'u1', tenUser: 'Minh Anh', soSao: 5, tieuDe: 'Một trải nghiệm đáng nhớ', noiDung: 'Không gian dễ chịu và đồ ăn rất ngon.', ngayTao: '2026-10-20', binhLuan: [node('c1', 'u1', 'Minh Anh', 'Mọi người thường ghé vào thời điểm nào?', [node('c2', 'u2', 'Quang Huy', 'Mình thường ghé vào buổi sáng.', [node('c3', 'u1', 'Minh Anh', 'Cảm ơn bạn đã chia sẻ nhé!')])]), node('c4', 'u2', 'Quang Huy', 'Một trải nghiệm rất đáng thử. '.repeat(15))]};
  const place = {id: 'p1', ten: 'Góc phố Hà Nội', slug: 'goc-pho-ha-noi', loai: 'AN_UONG', ratingAvg: 5, reviewCount: 1, trangThai: 'ACTIVE', reviews: [review], danhMuc: [], hinhAnh: [], diaChi: {thanhPho: 'Hà Nội'}};
  await page.route('**/api/**', async route => {
    const q = route.request(), url = new URL(q.url()), method = q.method();
    const ok = data => route.fulfill({json: {success: true, data}});
    if (method !== 'GET') writes.push({method, path: url.pathname, body: q.postDataJSON()});
    if (url.pathname === '/api/auth/csrf') return ok({token: 'test', headerName: 'X-CSRF-TOKEN'});
    if (url.pathname === '/api/auth/me') return logged ? ok(user) : route.fulfill({status: 401, json: {success: false, message: 'Chưa đăng nhập'}});
    if (url.pathname === '/api/auth/register') return ok(user);
    if (url.pathname === '/api/auth/login') {logged = true; return ok(user);}
    if (url.pathname === '/api/admin/nguoi-dung') return ok([user, {id: 'u2', hoTen: 'Quang Huy', role: 'USER', trangThai: 'ACTIVE'}]);
    if (url.pathname === '/api/admin/dia-diem') return ok([place]);
    if (url.pathname === '/api/danh-muc' || url.pathname === '/api/admin/danh-muc') return ok([]);
    if (url.pathname === '/api/dia-diem') return ok({content: [place], page: 1, size: 50, totalPages: 1, totalElements: 1});
    if (url.pathname === '/api/dia-diem/goc-pho-ha-noi') return ok(place);
    if (url.pathname.endsWith('/like')) {
      const commentId = url.pathname.split('/').at(-2);
      const find = nodes => {for (const c of nodes) {if (c.commentId === commentId) return c; const nested = find(c.traLoi || []); if (nested) return nested;}};
      const c = find(review.binhLuan); c.liked = method === 'PUT'; c.likeCount = c.liked ? 1 : 0;
      return ok({commentId, likeCount: c.likeCount, liked: c.liked});
    }
    if (method === 'POST' && url.pathname.endsWith('/comments')) {review.binhLuan.push(node('new-root', 'u1', 'Minh Anh', q.postDataJSON().noiDung)); return ok({});}
    if (method === 'POST' && url.pathname.endsWith('/c1/replies')) {review.binhLuan[0].traLoi.push(node('new-reply', 'u1', 'Minh Anh', q.postDataJSON().noiDung)); return ok({});}
    if (method === 'DELETE' && /\/comments\/[^/]+$/.test(url.pathname)) {review.binhLuan = review.binhLuan.filter(c => c.commentId !== url.pathname.split('/').pop()); return ok(null);}
    throw Error('Unexpected request: ' + method + ' ' + url.pathname);
  });
  try {
    for (const width of [390, 768, 1440]) for (const route of ['/login', '/register']) {
      await page.setViewportSize({width, height: 960}); await page.goto(base + route);
      await page.getByRole('heading', {level: 1}).waitFor(); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('dialog[open]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({path: path.join(out, route.slice(1) + '-' + width + '.png'), fullPage: true});
    }
    await page.getByLabel('Tên hiển thị', {exact: true}).fill('Minh Anh');
    await page.getByLabel('Tên đăng nhập', {exact: true}).fill('minhanh');
    await page.getByLabel('Email', {exact: true}).fill('qa@example.test');
    await page.getByLabel('Mật khẩu', {exact: true}).fill('Travel123');
    await page.getByLabel('Xác nhận mật khẩu', {exact: true}).fill('Mismatch123');
    await page.getByRole('button', {name: 'Tạo tài khoản', exact: true}).click();
    await page.getByText('Mật khẩu xác nhận không khớp.').waitFor();
    await page.getByLabel('Xác nhận mật khẩu', {exact: true}).fill('Travel123');
    await page.getByRole('button', {name: 'Tạo tài khoản', exact: true}).click();
    await page.waitForURL('**/login');
    assert.equal(await page.getByLabel('Email hoặc username', {exact: true}).inputValue(), 'qa@example.test');
    await page.getByLabel('Mật khẩu', {exact: true}).fill('Travel123');
    await page.getByRole('button', {name: 'Hiện mật khẩu', exact: true}).click();
    assert.equal(await page.getByLabel('Mật khẩu', {exact: true}).getAttribute('type'), 'text');
    await page.getByRole('button', {name: 'Đăng nhập', exact: true}).click(); await page.waitForURL('**/profile');
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({width, height: 960}); await page.goto(base + '/reviews/r1');
      await page.getByRole('heading', {name: 'Bình luận 4'}).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('[data-comment-level="3"]').getByRole('button', {name: 'Trả lời', exact: true}).count(), 0);
      await page.screenshot({path: path.join(out, 'comments-' + width + '.png'), fullPage: true});
    }
    const like = page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Thích bình luận', exact: true});
    await like.click();
    await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Bỏ thích bình luận', exact: true}).waitFor();
    assert.equal(await page.locator('[data-comment-id="c1"]').getByLabel('1 lượt thích', {exact: true}).textContent(), '1');
    await page.reload(); await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Bỏ thích bình luận', exact: true}).click();
    await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Thích bình luận', exact: true}).waitFor();
    assert.equal(await page.locator('[data-comment-id="c1"]').getByLabel('0 lượt thích', {exact: true}).textContent(), '0');
    await page.getByRole('button', {name: 'Ẩn phản hồi', exact: true}).last().click();
    await page.locator('[data-comment-id="c2"]').waitFor({state: 'detached'});
    await page.getByRole('button', {name: 'Xem 1 phản hồi', exact: true}).first().click();
    await page.locator('[data-comment-id="c2"]').waitFor();
    await page.getByRole('button', {name: 'Xem thêm', exact: true}).click(); await page.getByRole('button', {name: 'Thu gọn', exact: true}).waitFor();
    await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Trả lời', exact: true}).click();
    await page.getByRole('textbox', {name: 'Trả lời Minh Anh', exact: true}).fill('Phản hồi kiểm thử');
    await page.getByRole('button', {name: 'Gửi phản hồi', exact: true}).click();
    await page.getByText('Phản hồi kiểm thử', {exact: false}).waitFor();
    await page.getByLabel('Nội dung bình luận', {exact: true}).fill('Bình luận kiểm thử');
    await page.getByRole('button', {name: 'Gửi bình luận', exact: true}).click(); await page.getByText('Bình luận kiểm thử', {exact: true}).waitFor();
    assert.equal(await page.getByRole('button', {name: 'Chỉnh sửa', exact: true}).count(), 0);
    assert.equal(await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Xóa', exact: true}).count(), 1);
    assert.equal(await page.locator('[data-comment-id="c4"]').getByRole('button', {name: 'Xóa', exact: true}).count(), 0);
    await page.locator('[data-comment-id="c1"]').getByRole('button', {name: 'Xóa', exact: true}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Xác nhận', exact: true}).click();
    await page.locator('[data-comment-id="c1"]').waitFor({state: 'detached'});
    user.role = 'ADMIN'; await page.reload();
    await page.locator('[data-comment-id="c4"]').getByRole('button', {name: 'Xóa', exact: true}).waitFor();
    assert.equal(await page.getByRole('button', {name: 'Chỉnh sửa', exact: true}).count(), 0);
    await page.locator('[data-comment-id="c4"]').getByRole('button', {name: 'Xóa', exact: true}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Xác nhận', exact: true}).click();
    await page.locator('[data-comment-id="c4"]').waitFor({state: 'detached'});
    logged = false; await page.reload();
    await page.getByText('Bình luận kiểm thử', {exact: true}).waitFor();
    assert.equal(await page.getByRole('button', {name: 'Xóa', exact: true}).count(), 0);
    assert(writes.some(w => w.path.endsWith('/c1/replies') && w.body.noiDung === 'Phản hồi kiểm thử'));
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({status: 'passed', responsiveScreens: 9, flows: ['standalone auth routes', 'registration validation and login redirect', 'password visibility', 'three-level thread', 'collapse and expand', 'reply/create/delete HTTP contracts, owner/admin/guest delete UI permissions, no edit UI'], pageErrors: errors}));
  } finally {await browser.close(); await server.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
