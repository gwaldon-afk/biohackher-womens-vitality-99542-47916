import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "@/components/AchievementCard";
import { LevelProgressCard } from "@/components/LevelProgressCard";
import { Award, Target, Flame, Activity, TrendingUp } from "lucide-react";

const Achievements = () => {
  const {
    achievements,
    userAchievements,
    userPoints,
    loading,
    isUnlocked,
    getUnlockedCount,
    getTotalPoints,
    getLevel,
    getProgressToNextLevel
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'assessment', label: 'Assessments', icon: Target },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'protocol', label: 'Protocols', icon: Activity },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  // Group by tier
  const groupedByTier = {
    platinum: filteredAchievements.filter(a => a.tier === 'platinum'),
    gold: filteredAchievements.filter(a => a.tier === 'gold'),
    silver: filteredAchievements.filter(a => a.tier === 'silver'),
    bronze: filteredAchievements.filter(a => a.tier === 'bronze'),
  };

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Achievements & <span className="text-primary">Rewards</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your wellness milestones and earn rewards
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading achievements...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Level Progress */}
            <div className="mb-8">
              <LevelProgressCard
                level={getLevel()}
                totalPoints={getTotalPoints()}
                pointsToNextLevel={userPoints?.points_to_next_level || 100}
                progressPercentage={getProgressToNextLevel()}
                unlockedCount={getUnlockedCount()}
                totalAchievements={achievements.length}
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                {categories.map(category => {
                  const Icon = category.icon;
                  const count = category.id === 'all'
                    ? achievements.length
                    : achievements.filter(a => a.category === category.id).length;
                  const unlocked = category.id === 'all'
                    ? getUnlockedCount()
                    : achievements.filter(a => 
                        a.category === category.id && isUnlocked(a.achievement_id)
                      ).length;

                  return (
                    <TabsTrigger key={category.id} value={category.id} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({unlocked}/{count})
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category.id} value={category.id} className="space-y-8">
                  {/* Platinum Tier */}
                  {groupedByTier.platinum.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-purple-600">
                        Platinum Tier
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {groupedByTier.platinum.map(achievement => {
                          const userAch = getUserAchievement(achievement.achievement_id);
                          return (
                            <AchievementCard
                              key={achievement.id}
                              name={achievement.name}
                              description={achievement.description}
                              iconName={achievement.icon_name}
                              tier={achievement.tier}
                              points={achievement.points}
                              unlocked={!!userAch}
                              unlockedAt={userAch?.unlocked_at}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gold Tier */}
                  {groupedByTier.gold.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-yellow-600">
                        Gold Tier
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {groupedByTier.gold.map(achievement => {
                          const userAch = getUserAchievement(achievement.achievement_id);
                          return (
                            <AchievementCard
                              key={achievement.id}
                              name={achievement.name}
                              description={achievement.description}
                              iconName={achievement.icon_name}
                              tier={achievement.tier}
                              points={achievement.points}
                              unlocked={!!userAch}
                              unlockedAt={userAch?.unlocked_at}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Silver Tier */}
                  {groupedByTier.silver.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-gray-600">
                        Silver Tier
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {groupedByTier.silver.map(achievement => {
                          const userAch = getUserAchievement(achievement.achievement_id);
                          return (
                            <AchievementCard
                              key={achievement.id}
                              name={achievement.name}
                              description={achievement.description}
                              iconName={achievement.icon_name}
                              tier={achievement.tier}
                              points={achievement.points}
                              unlocked={!!userAch}
                              unlockedAt={userAch?.unlocked_at}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bronze Tier */}
                  {groupedByTier.bronze.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-amber-700">
                        Bronze Tier
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {groupedByTier.bronze.map(achievement => {
                          const userAch = getUserAchievement(achievement.achievement_id);
                          return (
                            <AchievementCard
                              key={achievement.id}
                              name={achievement.name}
                              description={achievement.description}
                              iconName={achievement.icon_name}
                              tier={achievement.tier}
                              points={achievement.points}
                              unlocked={!!userAch}
                              unlockedAt={userAch?.unlocked_at}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredAchievements.length === 0 && (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No achievements in this category yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Achievements;
