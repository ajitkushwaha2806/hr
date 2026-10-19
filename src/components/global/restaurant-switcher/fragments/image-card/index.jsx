import { Asset } from "@/components/common/Asset";

const RestaurantImage = ({ restaurant, className = "" }) => {
  return (
    <Asset
      src={restaurant?.logo}
      type="logo"
      name={restaurant?.name}
      variant="thumbnail"
      className={`size-8 sm:size-8.5 shrink-0 rounded-md border border-border/50 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${className}`}
    />
  );
};

export default RestaurantImage;