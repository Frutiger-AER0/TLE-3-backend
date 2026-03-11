import { getGalgje } from "../../services/minigames/galgjeService.js";

export default function show(req, res) {
    const { id } = req.params;

    const state = getGalgje(id);

    if (!state) {
        return res.status(404).json({
            error: "Session not found"
        });
    }

    res.json({ state });
}