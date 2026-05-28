import { BaseRepository } from "./base.repository.js";
import Dispute from "../../modules/disputes/dispute.model.js";

class DisputeRepository extends BaseRepository {
  constructor() {
    super(Dispute);
  }

  async findOpenDisputes({ page, limit }) {
    return this.paginate({
      filter: {
        status: {
          $in: ["OPEN", "UNDER_REVIEW", "ESCALATED"],
        },
      },

      page,
      limit,
    });
  }

  async escalateDispute(disputeId, session) {
    return this.model.findByIdAndUpdate(
      disputeId,
      {
        status: "ESCALATED",
        escalatedAt: new Date(),
      },
      {
        new: true,
        session,
      },
    );
  }
}

export default new DisputeRepository();
