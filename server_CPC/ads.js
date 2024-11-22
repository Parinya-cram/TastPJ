app.get("/api/getIOT", async (req, res) => {
  try {
    const iots = [];
    const iotSnapshot = await db.collection("PMDataT9").get();
    iotSnapshot.forEach((doc) => {
      const data = doc.data();
      delete data.iotPass; // Remove password before sending
      iots.push({ id: doc.id, ...data });
    });
    res.status(200).json(iots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch iots." });
  }
});
app.get("/api/getIOT/:iotId", async (req, res) => {
  const { iotId } = req.params;
  try {
    const iotDoc = await db.collection("iot").doc(PMDataT9).get();
    if (!iotDoc.exists) {
      return res.status(404).json({ message: "ไม่พบผู้ดูแลระบบ." });
    }
    const iotData = iotDoc.data();
    delete iotData.iotPass;
    res.status(200).json(iotData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch iot." });
  }
});