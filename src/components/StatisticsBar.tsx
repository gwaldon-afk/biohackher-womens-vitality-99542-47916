const StatisticsBar = () => {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">50,000+</p>
          <p className="text-sm text-muted-foreground">Assessments Completed</p>
        </div>
        <div className="hidden md:block h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">4.8★</p>
          <p className="text-sm text-muted-foreground">Average Rating</p>
        </div>
        <div className="hidden md:block h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">92%</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsBar;
