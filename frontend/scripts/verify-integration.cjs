const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
// Requires the isolated backend/database used by backend/scripts/verify-api.cjs.
(async () => {
  const server = await (await import('vite')).createServer({server: {host: '127.0.0.1', port: 5173, strictPort: true, proxy: {'/api': 'http://127.0.0.1:18080', '/uploads': 'http://127.0.0.1:18080'}}});
  await server.listen();
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage();
  const errors = [], flows = [];
  page.on('pageerror', e => errors.push(e.message));
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const out = path.resolve('../.runtime-test');
  await fs.mkdir(out, {recursive: true});
  const stamp = Date.now();
  const dialog = page.getByRole('dialog');
  async function open(url) {await page.goto(base + url); await page.locator('header').waitFor();}
  async function login(username, password) {
    await open('/login');
    await dialog.getByLabel('Email hoặc username', {exact: true}).fill(username);
    await dialog.getByLabel('Mật khẩu', {exact: true}).fill(password);
    await dialog.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
    await page.waitForURL(url => ['/admin', '/profile'].includes(url.pathname));
  }
  async function logout() {await page.getByRole('button', {name: 'Đăng xuất', exact: true}).click(); await page.getByRole('link', {name: 'Đăng nhập', exact: true}).waitFor();}
  try {
    await login(process.env.TEST_ADMIN || 'integration_admin', process.env.TEST_PASSWORD || 'Integration123');
    assert.equal(await page.getByLabel('Vai trò xem thử', {exact: true}).count(), 0);
    await open('/admin/categories/new');
    await dialog.getByLabel('Tên danh mục', {exact: true}).fill('Browser category ' + stamp);
    await dialog.getByRole('button', {name: 'Thêm danh mục', exact: true}).click();
    await page.waitForURL('**/admin/categories');
    await page.getByRole('heading', {name: 'Browser category ' + stamp, exact: true}).waitFor();
    await open('/admin/places/new');
    await dialog.getByLabel('Tên địa điểm', {exact: true}).fill('Browser place ' + stamp);
    await dialog.getByLabel('Danh mục địa điểm', {exact: true}).selectOption({label: 'Browser category ' + stamp});
    await dialog.getByLabel('Đường', {exact: true}).fill('Đường kiểm thử');
    await dialog.getByLabel('Quận/huyện', {exact: true}).fill('Quận thử');
    await dialog.getByLabel('Thành phố', {exact: true}).fill('Hà Nội');
    await dialog.getByLabel('Kinh độ', {exact: true}).fill('105.8342');
    await dialog.getByLabel('Vĩ độ', {exact: true}).fill('21.0285');
    await dialog.getByLabel('Mô tả địa điểm', {exact: true}).fill('Địa điểm được tạo qua trình duyệt và lưu trong MongoDB kiểm thử.');
    await dialog.locator('input[type=file]').setInputFiles(path.resolve('src/assets/images/hoi-an.png'));
    await dialog.locator('img[src^="/uploads/"]').waitFor();
    const saved = page.waitForResponse(r => r.url().endsWith('/api/admin/dia-diem') && r.request().method() === 'POST');
    await dialog.getByRole('button', {name: 'Lưu địa điểm', exact: true}).click();
    const place = (await (await saved).json()).data;
    assert(place.id);
    await page.waitForURL('**/admin/places');
    await page.reload();
    await page.getByRole('link', {name: 'Browser place ' + stamp, exact: true}).waitFor();
    flows.push('admin login, category/place create, real upload, reload persistence');
    await logout();
    const username = 'browser_' + stamp;
    await open('/register');
    await dialog.getByLabel('Tên đăng nhập', {exact: true}).fill(username);
    await dialog.getByLabel('Tên hiển thị', {exact: true}).fill('Browser Member');
    await dialog.getByLabel('Email', {exact: true}).fill(username + '@example.test');
    await dialog.getByLabel('Mật khẩu', {exact: true}).fill('Integration123');
    await dialog.getByLabel('Xác nhận mật khẩu', {exact: true}).fill('Integration123');
    await dialog.getByRole('button', {name: 'Đăng ký', exact: true}).click();
    await dialog.getByText('Đăng ký thành công. Bạn có thể đăng nhập.', {exact: true}).waitFor();
    await dialog.getByRole('link', {name: 'Đăng nhập', exact: true}).click();
    await dialog.getByLabel('Email hoặc username', {exact: true}).fill(username);
    await dialog.getByLabel('Mật khẩu', {exact: true}).fill('Integration123');
    await dialog.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
    await page.waitForURL('**/profile');
    await open('/reviews/new?place=' + place.id);
    await dialog.getByLabel('Tiêu đề đánh giá', {exact: true}).fill('Browser review ' + stamp);
    await dialog.getByLabel('Nội dung đánh giá', {exact: true}).fill('Đánh giá được ghi qua API thật vào MongoDB thử nghiệm.');
    await dialog.getByRole('button', {name: 'Đăng đánh giá', exact: true}).click();
    await page.waitForURL(url => /^\/reviews\/[a-f0-9-]+$/.test(url.pathname));
    const reviewUrl = page.url();
    await page.getByRole('heading', {name: 'Browser review ' + stamp, exact: true}).waitFor();
    await page.reload();
    await page.getByRole('heading', {name: 'Browser review ' + stamp, exact: true}).waitFor();
    await page.getByRole('link', {name: 'Sửa đánh giá', exact: true}).click();
    await dialog.getByRole('radio', {name: '3 sao', exact: true}).check();
    await dialog.getByRole('button', {name: 'Lưu thay đổi', exact: true}).click();
    await page.waitForURL(reviewUrl);
    await page.getByRole('button', {name: 'Trả lời · Xóa nội dung', exact: true}).click();
    await page.getByLabel('Nội dung bình luận', {exact: true}).fill('Browser persisted comment');
    await page.getByRole('button', {name: 'Gửi bình luận', exact: true}).click();
    await page.getByText('Cấp 1: Browser persisted comment', {exact: true}).waitFor();
    await page.reload();
    await page.getByText('Cấp 1: Browser persisted comment', {exact: true}).waitFor();
    flows.push('real registration/login, review create/edit, comment, reload persistence');
    await open('/search?q=Browser');
    await page.getByRole('heading', {name: 'Browser place ' + stamp, exact: true}).waitFor();
    await page.route('**/api/search?**', route => route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({success: false, message: 'Test outage'})}));
    await page.getByRole('searchbox').fill('outage');
    await page.getByRole('button', {name: 'Tìm kiếm', exact: true}).click();
    await page.getByText('Test outage', {exact: true}).waitFor();
    await page.unroute('**/api/search?**');
    await page.getByRole('button', {name: 'Thử lại', exact: true}).click();
    await page.getByText('Không tìm thấy địa điểm phù hợp.', {exact: true}).waitFor();
    flows.push('server search, HTTP failure and retry without mock fallback');
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({width, height: 900}); await open('/places/' + place.id);
      await page.getByRole('heading', {name: 'Browser place ' + stamp, exact: true}).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({path: path.join(out, 'integration-' + width + '.png'), fullPage: true});
    }
    await logout(); await open('/admin');
    await page.getByRole('alert').filter({hasText: 'ADMIN'}).waitFor();
    assert.deepEqual(errors, []);
    const result = {status: 'passed', flows, viewportChecks: 3, errors};
    await fs.writeFile(path.join(out, 'browser-verification.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {await page.screenshot({path: path.join(out, 'browser-failure.png'), fullPage: true}); throw e;}
  finally {await browser.close(); await server.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
