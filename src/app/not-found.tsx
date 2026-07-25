import Link from "next/link";
export default function NotFound() { return <main className="not-found"><span>404</span><h1>Collection not found.</h1><p>未找到您访问的产品系列。</p><Link className="button button-dark" href="/">Back to home · 返回首页</Link></main>; }
