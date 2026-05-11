import { PiEyeSlashBold, PiEyeLight } from "react-icons/pi";

type ShowPassButtonPropsType = {
  showPass: boolean;
  setShowPass: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ShowPassButton = (props: ShowPassButtonPropsType) => {
  return (
    <button
      type="button"
      onClick={() => props.setShowPass(!props.showPass)}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      tabIndex={-1}
      aria-label={props.showPass ? "Hide password" : "Show password"}
    >
      {props.showPass ? <PiEyeLight size={18} /> : <PiEyeSlashBold size={18} />}
    </button>
  );
};
