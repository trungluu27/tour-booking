export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  initials: string;
  color: string;
}

export interface Promotion {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlight: string;
  validUntil: string;
}

export interface Benefit {
  icon: "shield" | "headphones" | "wallet" | "leaf";
  title: string;
  description: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Nguyễn Thu Hà",
    role: "Khách hàng từ Hà Nội",
    rating: 5,
    initials: "TH",
    color: "from-primary-500 to-primary-700",
    content:
      "Mình đặt tour Đà Lạt cho gia đình 6 người. Quy trình đăng ký nhanh gọn, được chọn xe và tuyến đi rất chi tiết. Tài xế thân thiện, xe sạch sẽ. Sẽ đặt lại lần sau!",
  },
  {
    id: "t2",
    name: "Trần Minh Quân",
    role: "Travel blogger",
    rating: 5,
    initials: "MQ",
    color: "from-accent-400 to-accent-600",
    content:
      "Trải nghiệm đặt tour rất tốt. Form đăng ký rõ ràng, biết được còn bao nhiêu chỗ trên từng xe. Đoàn đông như mình rất tiện chia nhóm và bố trí.",
  },
  {
    id: "t3",
    name: "Lê Phương Linh",
    role: "Mẹ 2 con",
    rating: 5,
    initials: "PL",
    color: "from-emerald-500 to-emerald-700",
    content:
      "Đi tour gia đình lo nhất là chỗ ngồi. Ở đây mình biết trước xe nào, biển số gì, đặt là chắc chắn có chỗ. Bé nhà mình rất thích chuyến đi.",
  },
  {
    id: "t4",
    name: "Phạm Đức Anh",
    role: "Trưởng đoàn công ty",
    rating: 5,
    initials: "ĐA",
    color: "from-violet-500 to-violet-700",
    content:
      "Mình tổ chức team building 80 người, chia 3 xe. Mỗi nhân viên tự đăng ký xe mình muốn đi qua link, mình không phải gom danh sách. Rất tiết kiệm thời gian.",
  },
];

export const PROMOTIONS: Promotion[] = [
  {
    id: "p1",
    badge: "HOT",
    title: "Giảm 15% tour mùa hè",
    description:
      "Áp dụng cho mọi tour đặt từ thứ 2 đến thứ 5. Số lượng có hạn, đặt sớm để đảm bảo có chỗ.",
    highlight: "Tiết kiệm đến 500.000đ",
    validUntil: "Đến hết 31/08",
  },
  {
    id: "p2",
    badge: "MỚI",
    title: "Combo nhóm 4+ người",
    description:
      "Đặt theo nhóm từ 4 người trở lên trên cùng một xe, nhận ngay ưu đãi đặc biệt + tặng nước suối, khăn lạnh.",
    highlight: "Miễn phí dịch vụ kèm",
    validUntil: "Áp dụng cả năm",
  },
  {
    id: "p3",
    badge: "SỚM",
    title: "Early bird trước 14 ngày",
    description:
      "Đăng ký trước ngày khởi hành 14 ngày để nhận ưu đãi giá tốt nhất và đảm bảo chỗ trên xe đẹp.",
    highlight: "Ưu tiên chọn xe",
    validUntil: "Áp dụng mọi tour",
  },
];

export const BENEFITS: Benefit[] = [
  {
    icon: "shield",
    title: "Minh bạch tuyệt đối",
    description:
      "Bạn thấy rõ biển số xe, tài xế, sức chứa và số chỗ còn lại trước khi đặt.",
  },
  {
    icon: "wallet",
    title: "Đặt nhanh, không cọc",
    description:
      "Chỉ cần điền thông tin liên hệ, không cần thanh toán online phức tạp.",
  },
  {
    icon: "headphones",
    title: "Hỗ trợ tận tâm",
    description:
      "Đội ngũ tư vấn phản hồi nhanh qua số điện thoại bạn đăng ký.",
  },
  {
    icon: "leaf",
    title: "Trải nghiệm chất lượng",
    description:
      "Xe đời mới, tài xế nhiều năm kinh nghiệm, lộ trình được lên kỹ lưỡng.",
  },
];

export const STATS = [
  { value: "10.000+", label: "Khách hàng hài lòng" },
  { value: "500+", label: "Tour đã tổ chức" },
  { value: "98%", label: "Khách quay lại" },
  { value: "24/7", label: "Hỗ trợ tận tâm" },
];

export const BRAND = {
  name: "Tour Booking",
  tagline: "Khám phá Việt Nam dễ dàng",
  hotline: "1900 1234",
  email: "hello@tourbooking.vn",
  address: "TP. Hồ Chí Minh, Việt Nam",
};
