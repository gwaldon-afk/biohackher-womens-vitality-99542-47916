const StatisticsBar = () => {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">Until 1993</p>
          <p className="text-sm text-muted-foreground">Women Excluded from Clinical Trials</p>
        </div>
        <div className="hidden md:block h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">1 in 2</p>
          <p className="text-sm text-muted-foreground">Women Face Hormone Disruption</p>
        </div>
        <div className="hidden md:block h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">8-10 Years</p>
          <p className="text-sm text-muted-foreground">Average Wait for Perimenopause Diagnosis</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsBar;
