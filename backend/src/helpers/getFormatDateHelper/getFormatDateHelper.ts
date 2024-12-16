import moment from "moment-timezone";

const formatDateHelper = () => {
  return moment.tz("Asia/Karachi").format("HH:mm:ss YYYY/MM/DD");
};

export default formatDateHelper;
