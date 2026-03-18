import { getGalgjeMatchState } from "../../services/minigames/galgjeService.js";

export default function state(req, res) {
    const { id } = req.params;

    const matchState = getGalgjeMatchState(id);

    if (!matchState) {
        return res.status(404).json({
            error: "Match state not found"
        });
    }

    res.json({
        state: matchState
    });
}