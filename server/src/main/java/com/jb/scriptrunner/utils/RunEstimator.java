package com.jb.scriptrunner.utils;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;

public class RunEstimator {

    private ArrayList<Run> finishedRuns;

    public void add(long duration, long finishTime) {
        if (finishedRuns == null) {
            finishedRuns = new ArrayList<>();
        }
        finishedRuns.add(new Run(duration, finishTime));
    }

    public void clear() {
        finishedRuns.clear();
    }

    public long getEstimatedTime(int totalRuns) {
        long last = finishedRuns.get(finishedRuns.size() - 1).getDuration();
        System.out.println("Time: " + last);
        int i = finishedRuns.size();
        double  expectedTimePerScript = 0;
        for (Run run: finishedRuns) {
            double weight;
            if (i != finishedRuns.size()) {
                weight = 1.0 / Math.pow(2, i);
            } else {
                weight = 1.0 / Math.pow(2, i - 1);
            }
            expectedTimePerScript = expectedTimePerScript + weight * run.getDuration();
            i--;
        }
        System.out.println("Expected time per script: " + expectedTimePerScript);
        System.out.println("Expected time remaining: " + (long)expectedTimePerScript * (totalRuns - finishedRuns.size()));
        return (long)expectedTimePerScript * (totalRuns - finishedRuns.size());
    }



}

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
class Run {
    private long duration;
    private long finishTime;
}
