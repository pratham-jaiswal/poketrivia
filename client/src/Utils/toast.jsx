import { toast } from "react-toastify";

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      autoClose: 5000,
    });
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
    });
  },
  reward: (rewards) => {
    const coinText =
      rewards.dailyBonus > 0
        ? `${rewards.coins} + ${rewards.dailyBonus} Bonus`
        : `${rewards.coins}`;
    const message = `+${rewards.xp} XP | +${coinText} Coins ${rewards.dailyBonus > 0 ? "🔥" : ""}`;
    toast.info(message, {
      ...toastConfig,
    });
  },
};
