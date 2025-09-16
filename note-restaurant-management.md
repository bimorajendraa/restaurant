### kĩ thuật tránh call duplicate api ở refresh-token và logout

- [restaurant-management/client/src/app/(public)/(auth)/logout/page.tsx] - chạy ở client component - sử dụng useRef sẽ giữ một flag (biến cờ) để biết đã bắt đầu gọi hàm logout -> ngăn hàm logout chạy nhiều lần cùng lúc

  ```tsx
  const isLoggingOut = useRef(null)
  ```

* tại sao không dùng useState mà lại dùng useRef trong trường hợp này ?

- Nếu dùng useState, mỗi lần setState sẽ làm re-render lại component không cần thiết.
- Nhưng với useRef, giá trị vẫn giữ được xuyên suốt vòng đời component mà không tốn render.

- [restaurant-management/client/src/apiRequests/auth.ts] - chạy ở server component - sử dụng một biến refreshTokenRequest -> tránh gọi refreshToken duplicate

```tsx
refreshTokenRequest: null as Promise<{
  status: number
  payload: RefreshTokenResType
}> | null
```

### sử dụng useMemo và useCallback để tránh tính toán lại function hoặc phép toán phức tạp

- [restaurant-management/client/src/app/manage/setting/update-profile-form.tsx]:
  1. sử dụng useRef để thao tác với DOM: gắn ref vào nút upload file hidden -> thao tác với nút upload file(được hiển thị) -> trigger tới nút upload file hidden
  2. sử dụng useMemo để tránh tính toán lại preview
  ```tsx
  const preview = useMemo(() => {
    return file ? URL.createObjectURL(file) : avatar
  }, [file, avatar])
  ```
- [restaurant-management/client/src/components/app-provider.tsx]: sử dụng useCallback để tránh việc khai báo lại hàm một cách không cần thiết mỗi lần component cha được render

```tsx
const setIsAuth = useCallback((isAuth: boolean) => {
  if (isAuth) {
    setIsAuthState(true)
  } else {
    setIsAuthState(false)
    removeAccessTokenFromLocalStorage()
    removeRefreshTokenFromLocalStorage()
  }
}, [])
```

### Logout Flow

- Case 1: Khi người dùng ấn nút logout : gọi tới logout route handler của Nextjs -> gọi tới server backend(kèm theo refreshToken) -> logout

- Case 2: cơ chế auto logout : khi có lỗi liên quan tới authentication - 401 (accessToken hoặc refreshToken không hợp lệ)

* client -> gọi tới logout route handler Nextjs và buộc logout -> xóa AT và RT khỏi local storage
* server -> truyền thêm AT vào trong đường dẫn để buộc logout từ server backend

### Refresh Token Flow

- Case 1: khi đang sử dụng thì access token hết hạn: khi thời gian của accessToken < 1/3 x (tổng thời gian hết hạn của accessToken) -> gọi api tới route handler refresh token -> gọi tới server backend lấy accessToken và refreshToken mới -> set accessToken và refreshToken mới vào cookie -> set accessToken và refreshToken mới vào localStorage

- Case 2: access token hết hạn sau một khoảng thời gian dài không truy cập: khi truy cập currentPage -> middleware -> set refreshToken và redirect page(currentPage) vào refreshToken URL -> refreshTokenPage(để lấy AT và RT mới) -> currentPage(redirect về lại page ban đầu đã truy cập)

- Case 3: đang dùng thì refreshToken hết hạn -> redirect về Login và xóa hết tokens

- Case 4: lâu ngày vào web thì refresh token hết hạn() -> middleware -> set clearTokens="true" vào Login URL -> Login Page -> xóa toàn bộ tokens

### sử dụng useContext

- [restaurant-management/client/src/app/(public)/nav-items.tsx] -> component 1
- [restaurant-management/client/src/app/(public)/(auth)/login/login-form.tsx] -> component 2
  -> cùng sử dụng context là isAuth thì chỉ cần isAuth thay đổi thì cả 2 component đều bị re-render
