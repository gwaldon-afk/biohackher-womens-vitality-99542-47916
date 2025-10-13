import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Heart, ThumbsDown } from "lucide-react";
import { longevityFoodDatabase } from "@/data/longevityFoodDatabase";
import { useFoodPreferences } from "@/hooks/useFoodPreferences";

const FoodPreferencesSidebar = () => {
  const { preferences, removeLikedFood, removeDislikedFood, clearAllPreferences } = useFoodPreferences();

  const getLikedFoodNames = () => {
    return preferences.likedFoods
      .map(id => longevityFoodDatabase.find(f => f.id === id))
      .filter(Boolean);
  };

  const getDislikedFoodNames = () => {
    return preferences.dislikedFoods
      .map(id => longevityFoodDatabase.find(f => f.id === id))
      .filter(Boolean);
  };

  const likedFoods = getLikedFoodNames();
  const dislikedFoods = getDislikedFoodNames();
  const totalPreferences = preferences.likedFoods.length + preferences.dislikedFoods.length;

  if (totalPreferences === 0) {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Your Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Select foods you love or want to avoid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No preferences selected yet. Click the buttons on food cards to start building your preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Your Preferences
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllPreferences}
            className="text-xs h-7"
          >
            Clear All
          </Button>
        </div>
        <CardDescription className="text-xs">
          {totalPreferences} food{totalPreferences !== 1 ? 's' : ''} selected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {likedFoods.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-green-700 dark:text-green-400">
              <Heart className="h-3.5 w-3.5 fill-current" />
              Preferred Foods ({likedFoods.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {likedFoods.map((food) => (
                <Badge 
                  key={food?.id} 
                  variant="secondary" 
                  className="text-xs pr-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                >
                  <span className="mr-1">{food?.icon}</span>
                  {food?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-green-200 dark:hover:bg-green-800"
                    onClick={() => removeLikedFood(food?.id || '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {dislikedFoods.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-red-700 dark:text-red-400">
              <ThumbsDown className="h-3.5 w-3.5" />
              Foods to Avoid ({dislikedFoods.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {dislikedFoods.map((food) => (
                <Badge 
                  key={food?.id} 
                  variant="secondary" 
                  className="text-xs pr-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                >
                  <span className="mr-1">{food?.icon}</span>
                  {food?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-200 dark:hover:bg-red-800"
                    onClick={() => removeDislikedFood(food?.id || '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t">
          These preferences will be used to personalize your meal plans.
        </p>
      </CardContent>
    </Card>
  );
};

export default FoodPreferencesSidebar;
