import unittest
from extract_pilotage import coordinate_pairs

class Coordinates(unittest.TestCase):
    def test_formats_and_axis_order(self):
        for raw in ["50°21.45'N, 003°32.10'W",'50°21\'27"N 003°32\'06"W',"latitude: 50.3575, longitude: -3.5350","003°32.10'W 50°21.45'N"]:
            with self.subTest(raw=raw):
                found,_=coordinate_pairs(raw)
                self.assertEqual(len(found),1)
                self.assertAlmostEqual(found[0]['latitude'],50.3575)
                self.assertAlmostEqual(found[0]['longitude'],-3.535)
    def test_all_pairs(self):
        found,_=coordinate_pairs("50°21.45'N, 003°32.10'W and 53°40'N., 3°6.42'W")
        self.assertEqual(len(found),2)
    def test_invalid_minutes(self):
        found,bad=coordinate_pairs("50°61'N 003°32'W")
        self.assertFalse(found);self.assertTrue(bad)
    def test_no_guessing_bare_numbers_or_cross_feature_pairs(self):
        self.assertFalse(coordinate_pairs('50.3575, -3.5350')[0])
        self.assertFalse(coordinate_pairs("53°40'N a different feature 3°6'W")[0])

if __name__=='__main__':unittest.main()
