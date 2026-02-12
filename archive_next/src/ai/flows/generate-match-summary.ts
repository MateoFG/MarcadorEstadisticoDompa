// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates a detailed match summary, highlighting key statistics and insights to help analyze team performance.
 *
 * - generateMatchSummary - A function that generates the match summary.
 * - GenerateMatchSummaryInput - The input type for the generateMatchSummary function.
 * - GenerateMatchSummaryOutput - The return type for the generateMatchSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PointCountsSchema = z.object({
  PPM: z.number().describe('Own team - Points Per Match'),
  PRE: z.number().describe('Own team - Points from Rival Errors'),
  PPE: z.number().describe('Rival team - Points from Own Errors'),
  PRM: z.number().describe('Rival team - Points Per Match'),
});

const SetScoreSchema = z.object({
  own: z.number().describe('Own team score'),
  rival: z.number().describe('Rival team score'),
});

const SetReportSchema = z.object({
  setNumber: z.number().describe('Set number'),
  finalScore: SetScoreSchema.describe('Final score of the set'),
  pointCounts: PointCountsSchema.describe('Point counts for the set'),
  ownEfficiency: z.number().describe('Own team efficiency in the set'),
  rivalErrorImpact: z.number().describe('Rival team error impact in the set'),
});

const MatchDataSchema = z.object({
  teamNames: z.object({
    own: z.string().describe('Own team name'),
    rival: z.string().describe('Rival team name'),
  }).describe('Team names'),
  currentSet: z.number().describe('Current set number'),
  currentSetPointsLog: z.array(z.string()).describe('Log of points scored in the current set'),
  setsWon: z.object({
    own: z.number().describe('Number of sets won by own team'),
    rival: z.number().describe('Number of sets won by rival team'),
  }).describe('Sets won by each team'),
  matchHistory: z.array(SetReportSchema).describe('History of sets played in the match'),
  isMatchOver: z.boolean().describe('Whether the match is over'),
  matchId: z.string().describe('Unique ID for the match'),
});

const GenerateMatchSummaryInputSchema = MatchDataSchema;
export type GenerateMatchSummaryInput = z.infer<typeof GenerateMatchSummaryInputSchema>;

const GenerateMatchSummaryOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the match.'),
});
export type GenerateMatchSummaryOutput = z.infer<typeof GenerateMatchSummaryOutputSchema>;

export async function generateMatchSummary(input: GenerateMatchSummaryInput): Promise<GenerateMatchSummaryOutput> {
  return generateMatchSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMatchSummaryPrompt',
  input: {schema: GenerateMatchSummaryInputSchema},
  output: {schema: GenerateMatchSummaryOutputSchema},
  prompt: `You are an expert volleyball coach providing a match summary.

  Based on the match data provided, generate a detailed summary of the match, highlighting key statistics and insights.
  Include the final score, sets won by each team, and a brief analysis of each set, including own efficiency and rival error impact.
  Also, include an overview of the team's performance and key takeaways.

  Match Data: {{{json input}}}
  `,
});

const generateMatchSummaryFlow = ai.defineFlow(
  {
    name: 'generateMatchSummaryFlow',
    inputSchema: GenerateMatchSummaryInputSchema,
    outputSchema: GenerateMatchSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
