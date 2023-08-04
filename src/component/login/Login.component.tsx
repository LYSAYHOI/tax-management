import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.style.css";

export default function LoginComponent() {
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("at");
    if (token != null && token !== "") {
      navigate("/invoice-management");
    }
  }, []);

  const openSourceCode = () => {
    setShowCode(true);
  };

  const onClickStartUsing = () => {
    if (token === "") {
      alert("Nhập mã để tiếp tục");
    } else {
      localStorage.setItem("at", token.replaceAll("'", ""));
      navigate("/invoice-management");
    }
  };

  const onChangeTokenInput = (e: any) => {
    setToken(e.target.value);
  };

  return (
    <div className="center">
      <h2>Nhập mã từ trang thuế</h2>
      <input type="text" value={token} onChange={onChangeTokenInput} />
      <button onClick={onClickStartUsing}>Bắt đầu sử dụng</button>
      <p>
        Note: Copy mã code dưới vào console của trang thuế để lấy mã{" "}
        <u className="link" onClick={openSourceCode}>
          Xem
        </u>
      </p>
      {showCode && (
        <span className="no-wrap">
          {`function getCookie(name) {
    const value = \`; \${document.cookie}\`;
    const parts = value.split(\`; \${name}=\`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
getCookie("jwt");`}
        </span>
      )}
    </div>
  );
}
